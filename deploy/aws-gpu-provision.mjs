// Create (or reuse) the GPU renderer: a g4dn.xlarge instance that is stopped almost all the time.
// The main server starts it when episodes are due (server.py, gpu_wake); it renders them with
// deploy/render_worker.py and switches itself off. Also gives the main server the right to start it,
// installs the renderer on it (deploy/gpu-setup.sh) and starts it once. Uses the AWS credentials in
// ~/.aws, like aws-provision.mjs. Safe to re-run, also after changing deploy/render_worker.py.
//
//   node deploy/aws-gpu-provision.mjs
//
// Needs @aws-sdk/client-ec2 and @aws-sdk/client-iam (resolved from AWS_SDK_FROM, default D:/Marketplace).
// New AWS accounts may run 0 GPU instances: request "Running On-Demand G and VT instances" = 4 vCPUs
// in Service Quotas (ap-south-1) first.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(path.join(process.env.AWS_SDK_FROM || 'D:/Marketplace', 'package.json'));
const {
  EC2Client, DescribeSecurityGroupsCommand, DescribeImagesCommand, DescribeInstancesCommand, RunInstancesCommand,
  StartInstancesCommand, AssociateIamInstanceProfileCommand, DescribeIamInstanceProfileAssociationsCommand,
  waitUntilInstanceRunning,
} = require('@aws-sdk/client-ec2');
const {
  IAMClient, GetRoleCommand, CreateRoleCommand, PutRolePolicyCommand, GetInstanceProfileCommand,
  CreateInstanceProfileCommand, AddRoleToInstanceProfileCommand,
} = require('@aws-sdk/client-iam');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGION = process.env.AWS_REGION_TR || 'ap-south-1';
const NAME = 'tickletoons-gpu';
const SERVER_TAG = 'tickletoons';
const KEY_NAME = 'tickletoons-key';
const KEY_FILE = path.join(os.homedir(), '.ssh', 'tickletoons.pem');
const SG_NAME = 'tickletoons-sg';
const SITE_URL = 'https://tickletoons.vercel.app';
const WORKER_KEY = path.join(ROOT, 'data', 'aws-worker.key'); // a copy of the main server's data/worker.key
const TYPE = 'g4dn.xlarge';   // NVIDIA T4; about $0.58/hour on demand in Mumbai, $0.22 as spot
// Spot needs the EC2 Spot service-linked role, which an admin creates once (IAM > Roles > Create > EC2 Spot).
const SPOT = process.env.GPU_SPOT === '1';
const ROLE = 'tickletoons-server';
const ec2 = new EC2Client({ region: REGION });
const tag = (Name) => [{ Key: 'Name', Value: Name }, { Key: 'app', Value: NAME }];
const instances = async (app) => (await ec2.send(new DescribeInstancesCommand({ Filters: [
  { Name: 'tag:app', Values: [app] }, { Name: 'instance-state-name', Values: ['pending', 'running', 'stopping', 'stopped'] },
] }))).Reservations.flatMap((r) => r.Instances);

if (!fs.existsSync(WORKER_KEY)) throw new Error(`${WORKER_KEY} is missing (copy ~/tickletoons/data/worker.key from the main server)`);
const server = (await instances(SERVER_TAG))[0];
if (!server) throw new Error('Main server not found: run node deploy/aws-provision.mjs first');
const sg = (await ec2.send(new DescribeSecurityGroupsCommand({ Filters: [{ Name: 'group-name', Values: [SG_NAME] }] }))).SecurityGroups[0];

// 1. the GPU instance (as spot: "persistent" + "stop", so it can be stopped and started again like a normal one)
let gpu = (await instances(NAME))[0];
if (!gpu) {
  const { Images } = await ec2.send(new DescribeImagesCommand({
    Owners: ['amazon'],
    Filters: [{ Name: 'name', Values: ['Deep Learning Base OSS Nvidia Driver GPU AMI (Ubuntu 24.04)*'] },
      { Name: 'architecture', Values: ['x86_64'] }, { Name: 'state', Values: ['available'] }],
  }));
  const ami = Images.sort((a, b) => b.CreationDate.localeCompare(a.CreationDate))[0];
  if (!ami) throw new Error('NVIDIA Ubuntu 24.04 image not found');
  const root = ami.BlockDeviceMappings.find((b) => b.DeviceName === ami.RootDeviceName);
  console.log(`Launching ${TYPE}${SPOT ? ' (spot)' : ''} with ${ami.Name}`);
  const run = await ec2.send(new RunInstancesCommand({
    ImageId: ami.ImageId, InstanceType: TYPE, KeyName: KEY_NAME, SecurityGroupIds: [sg.GroupId], MinCount: 1, MaxCount: 1,
    ...(SPOT && { InstanceMarketOptions: { MarketType: 'spot', SpotOptions: { SpotInstanceType: 'persistent', InstanceInterruptionBehavior: 'stop' } } }),
    InstanceInitiatedShutdownBehavior: 'stop',
    BlockDeviceMappings: [{ DeviceName: ami.RootDeviceName, Ebs: { VolumeSize: Math.max(root?.Ebs?.VolumeSize || 0, 60), VolumeType: 'gp3', DeleteOnTermination: true, Encrypted: true } }],
    MetadataOptions: { HttpTokens: 'required' },
    TagSpecifications: [{ ResourceType: 'instance', Tags: tag(NAME) }, { ResourceType: 'volume', Tags: tag(`${NAME}-disk`) }],
  }));
  gpu = run.Instances[0];
} else if (gpu.State?.Name === 'stopped') {
  await ec2.send(new StartInstancesCommand({ InstanceIds: [gpu.InstanceId] })); // for the install below
}
console.log(`GPU instance ${gpu.InstanceId}. Waiting until running…`);

// 2. the main server may start it (and nothing else): an instance role
const iam = new IAMClient({ region: REGION });
const exists = (p) => p.then(() => true, (e) => { if (e.name === 'NoSuchEntityException') return false; throw e; });
if (!await exists(iam.send(new GetRoleCommand({ RoleName: ROLE })))) {
  await iam.send(new CreateRoleCommand({ RoleName: ROLE, AssumeRolePolicyDocument: JSON.stringify({
    Version: '2012-10-17', Statement: [{ Effect: 'Allow', Principal: { Service: 'ec2.amazonaws.com' }, Action: 'sts:AssumeRole' }] }) }));
  console.log(`Role ${ROLE} created`);
}
await iam.send(new PutRolePolicyCommand({ RoleName: ROLE, PolicyName: 'start-gpu-renderer', PolicyDocument: JSON.stringify({
  Version: '2012-10-17', Statement: [
    { Effect: 'Allow', Action: 'ec2:DescribeInstances', Resource: '*' },
    { Effect: 'Allow', Action: 'ec2:StartInstances', Resource: '*', Condition: { StringEquals: { 'aws:ResourceTag/app': NAME } } },
  ] }) }));
if (!await exists(iam.send(new GetInstanceProfileCommand({ InstanceProfileName: ROLE })))) {
  await iam.send(new CreateInstanceProfileCommand({ InstanceProfileName: ROLE }));
  await iam.send(new AddRoleToInstanceProfileCommand({ InstanceProfileName: ROLE, RoleName: ROLE }));
  await new Promise((r) => setTimeout(r, 15000)); // a new profile takes a moment before EC2 can use it
}
const assoc = (await ec2.send(new DescribeIamInstanceProfileAssociationsCommand({ Filters: [{ Name: 'instance-id', Values: [server.InstanceId] }] }))).IamInstanceProfileAssociations;
if (!assoc.some((a) => a.State === 'associated' || a.State === 'associating')) {
  await ec2.send(new AssociateIamInstanceProfileCommand({ InstanceId: server.InstanceId, IamInstanceProfile: { Name: ROLE } }));
  console.log(`Main server ${server.InstanceId} may now start the GPU instance`);
}

// 3. install the renderer and start it once (it renders what is due, then switches the machine off)
await waitUntilInstanceRunning({ client: ec2, maxWaitTime: 600 }, { InstanceIds: [gpu.InstanceId] });
gpu = (await instances(NAME))[0];
const target = `ubuntu@${gpu.PublicIpAddress}`;
const opt = ['-i', KEY_FILE, '-o', 'ConnectTimeout=20', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=no', '-o', 'UserKnownHostsFile=/dev/null', '-o', 'LogLevel=ERROR'];
const ssh = (cmd) => execFileSync('ssh', [...opt, target, cmd], { stdio: 'inherit' });
for (let i = 0; ; i++) { // sshd needs a minute after boot
  try { execFileSync('ssh', [...opt, target, 'true'], { stdio: 'ignore' }); break; } catch {
    if (i > 20) throw new Error(`Cannot SSH to ${target}`);
    await new Promise((r) => setTimeout(r, 10000));
  }
}
ssh('sudo systemctl stop tickletoons-gpu-renderer 2>/dev/null; sudo shutdown -c 2>/dev/null; mkdir -p ~/tickletoons/deploy ~/tickletoons/data; true');
execFileSync('scp', [...opt, path.join(ROOT, 'deploy', 'render_worker.py'), path.join(ROOT, 'deploy', 'gpu-setup.sh'), `${target}:tickletoons/deploy/`], { stdio: 'inherit' });
execFileSync('scp', [...opt, WORKER_KEY, `${target}:tickletoons/data/worker.key`], { stdio: 'inherit' });
ssh(`chmod 600 ~/tickletoons/data/worker.key && cd ~/tickletoons && sudo bash deploy/gpu-setup.sh ${SITE_URL} && sudo systemctl start tickletoons-gpu-renderer`);

console.log('\nREADY: the GPU renderer renders what is due now, then switches itself off.');
console.log(`  gpu    : ${gpu.InstanceId} (${TYPE}${SPOT ? ', spot' : ''})`);
console.log(`  server : ${server.InstanceId} may start it (role ${ROLE})`);
console.log(`  logs   : ssh -i "${KEY_FILE}" ${target} sudo journalctl -u tickletoons-gpu-renderer -f`);
