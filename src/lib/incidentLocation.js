const normalized = value => String(value || '').trim().toLocaleLowerCase('it-IT');

export const incidentLocationPrecision = incident => {
  const declared = normalized(incident?.location_precision);
  const address = normalized(incident?.address);
  const city = normalized(incident?.city);

  if (declared === 'municipality') return 'municipality';
  if (declared === 'precise' && address && city && address !== city) return 'precise';
  if (address && city && address !== city) return 'precise';
  return 'municipality';
};

export const hasPreciseIncidentLocation = incident => (
  incidentLocationPrecision(incident) === 'precise'
  && Boolean(normalized(incident?.location_evidence) || normalized(incident?.address))
  && Number.isFinite(Number(incident?.latitude))
  && Number.isFinite(Number(incident?.longitude))
  && Number(incident?.latitude) !== 0
  && Number(incident?.longitude) !== 0
);
