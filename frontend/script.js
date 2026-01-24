function toggleRuleConfig() {
  const ruleType = document.getElementById('ruleType').value;
  const panels = {
      time: document.getElementById('config-time'),
      location: document.getElementById('config-location'),
      device: document.getElementById('config-device')
  };

  Object.values(panels).forEach(panel => panel.classList.add('hidden'));

  if (ruleType !== 'none' && panels[ruleType]) {
      panels[ruleType].classList.remove('hidden');
  }
}
