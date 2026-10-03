const normalized = value => String(value || '').trim().toLocaleLowerCase('it-IT');

export const incidentLocationPrecision = incident => {
  const declared = normalized(incident?.location_precision);
  if (declared === 'precise' || declared === 'municipality') return declared;

  const address = normalized(incident?.address);
  const city = normalized(incident?.city);
  return address && city && address !== city ? 'precise' : 'municipality';
};

export const hasPreciseIncidentLocation = incident => (
  incidentLocationPrecision(incident) === 'precise'
  && Number.isFinite(Number(incident?.latitude))
  && Number.isFinite(Number(incident?.longitude))
);
