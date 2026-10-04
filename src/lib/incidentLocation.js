const normalized = value => String(value || '').trim().toLocaleLowerCase('it-IT');

export const incidentLocationPrecision = incident => {
  const declared = normalized(incident?.location_precision);
  if (declared === 'precise' || declared === 'municipality') return declared;

  const address = normalized(incident?.address);
  const city = normalized(incident?.city);
  if (address || city) return 'precise';
  return 'municipality';
};

export const hasPreciseIncidentLocation = incident => (
  Number.isFinite(Number(incident?.latitude))
  && Number.isFinite(Number(incident?.longitude))
  && Number(incident?.latitude) !== 0
  && Number(incident?.longitude) !== 0
);
