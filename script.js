// Theme toggle function
document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  const btn = document.getElementById('themeToggle');
  if (document.body.classList.contains('dark-theme')) {
    btn.textContent = 'Switch to Light Mode';
  } else {
    btn.textContent = 'Switch to Dark Mode';
  }
});

function cidrToIp(cidr) {
  const [ip, prefix] = cidr.split('/');
  const ipParts = ip.split('.').map(Number);
  let ipNum = 0;
  for (let part of ipParts) {
    ipNum = (ipNum << 8) + part;
  }
  return [ipNum >>> 0, Number(prefix)];
}

function ipToStr(ip) {
  return [
    (ip >>> 24) & 0xff,
    (ip >>> 16) & 0xff,
    (ip >>> 8) & 0xff,
    ip & 0xff
  ].join('.');
}

function calcSubnetBits(hostCount) {
  return 32 - Math.ceil(Math.log2(hostCount + 2)); // +2 for network and broadcast
}

function getSubnetSize(cidrBits) {
  return Math.pow(2, 32 - cidrBits);
}

function getBroadcastAddress(networkIp, subnetSize) {
  return (networkIp + subnetSize - 1) >>> 0;
}

function nextSubnetIp(currentIp, subnetSize) {
  return (currentIp + subnetSize) >>> 0;
}

function cidrToSubnetMask(cidrBits) {
  const mask = cidrBits === 0 ? 0 : (~0 << (32 - cidrBits)) >>> 0;
  return ipToStr(mask);
}

function calculateSubnets(baseCIDR, hosts, mode) {
  const [baseIp, basePrefix] = cidrToIp(baseCIDR);
  const totalIPs = getSubnetSize(basePrefix);

  if (mode === 'vlsm') {
    hosts.sort((a, b) => b - a);
  } else if (mode === 'fixed') {
    const maxHosts = Math.max(...hosts);
    hosts = new Array(hosts.length).fill(maxHosts);
  }

  let currentIp = baseIp;
  const results = [];

  for (let i = 0; i < hosts.length; i++) {
    const hostCount = hosts[i];
    const subnetBits = calcSubnetBits(hostCount);
    const subnetSize = getSubnetSize(subnetBits);

    if (currentIp + subnetSize > baseIp + totalIPs) {
      break;
    }

    const networkAddress = currentIp;
    const broadcastAddress = getBroadcastAddress(networkAddress, subnetSize);
    const usableStart = networkAddress + 1;
    const usableEnd = broadcastAddress - 1;
    const subnetMask = cidrToSubnetMask(subnetBits);

    results.push({
      requiredHosts: hostCount,
      cidr: '/' + subnetBits,
      subnetMask: subnetMask,
      subnetSize: subnetSize,
      networkAddress: ipToStr(networkAddress),
      broadcastAddress: ipToStr(broadcastAddress),
      usableRange: ipToStr(usableStart) + ' - ' + ipToStr(usableEnd)
    });

    currentIp = nextSubnetIp(currentIp, subnetSize);
  }

  return { totalIPs, results };
}

document.getElementById('subnetForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const baseCIDR = document.getElementById('baseCIDR').value.trim();
  const hostList = document.getElementById('hostList').value.trim();
  const allocationMode = document.getElementById('allocationMode').value;

  if (!baseCIDR || !hostList) {
    alert('Please fill both fields!');
    return;
  }

  const hosts = hostList.split(',').map(h => parseInt(h.trim())).filter(h => !isNaN(h) && h > 0);
  if (hosts.length === 0) {
    alert('Enter valid host numbers separated by commas');
    return;
  }

  const { totalIPs, results } = calculateSubnets(baseCIDR, hosts, allocationMode);

  let title = allocationMode === 'vlsm' 
    ? 'Subnet Allocation Result for VLSM' 
    : 'Subnet Allocation Result for Fixed Length';

  let outputHTML = `<h2>${title}</h2>`;
  outputHTML += `<p><strong>Base CIDR:</strong> ${baseCIDR}</p>`;
  outputHTML += `<p><strong>Total IPs Available:</strong> ${totalIPs}</p>`;

  results.forEach((subnet, idx) => {
    outputHTML += `
      <h3>Subnet ${idx + 1}</h3>
      <p><strong>Required Hosts:</strong> ${subnet.requiredHosts}</p>
      <p><strong>CIDR:</strong> ${subnet.cidr}</p>
      <p><strong>Subnet Mask:</strong> ${subnet.subnetMask}</p>
      <p><strong>Subnet Size:</strong> ${subnet.subnetSize} IPs</p>
      <p><strong>Network Address:</strong> ${subnet.networkAddress}</p>
      <p><strong>Broadcast Address:</strong> ${subnet.broadcastAddress}</p>
      <p><strong>Usable Range:</strong> ${subnet.usableRange}</p>
    `;
  });

  document.getElementById('output').innerHTML = outputHTML;
});
