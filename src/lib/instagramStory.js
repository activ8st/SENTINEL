import { resolveIncidentType } from '@/lib/incidentFilters';

const SOCIAL_FORMATS = {
  story: { width: 1080, height: 1920, label: 'storia' },
  post: { width: 1080, height: 1350, label: 'post' },
};

const TYPE_LABELS = {
  crime: 'SICUREZZA',
  accident: 'VIABILITA',
  fire: 'INCENDIO',
  traffic: 'TRAFFICO',
  weather: 'METEO',
  suspicious: 'SEGNALAZIONE',
  other: 'AGGIORNAMENTO',
};

const TYPE_COLORS = {
  crime: '#f43f5e',
  accident: '#f59e0b',
  fire: '#ef4444',
  traffic: '#38bdf8',
  weather: '#60a5fa',
  suspicious: '#a78bfa',
  other: '#10b981',
};

const FALLBACK_PHOTOS = {
  crime: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1400&q=85',
  accident: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1400&q=85',
  fire: 'https://images.unsplash.com/photo-1599827553209-6f17e9e2009d?auto=format&fit=crop&w=1400&q=85',
  traffic: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1400&q=85',
  weather: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1400&q=85',
  suspicious: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1400&q=85',
  other: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=85',
};

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const loadFirstImage = async (sources) => {
  for (const source of sources) {
    try {
      return await loadImage(source);
    } catch {
      // Try the next bundled brand asset.
    }
  }
  return null;
};

const roundedRect = (context, x, y, width, height, radius) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
};

const drawCoverImage = (context, image, x, y, width, height) => {
  const scale = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  context.drawImage(
    image,
    (image.width - sourceWidth) / 2,
    (image.height - sourceHeight) / 2,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
};

const wrapText = (context, text, maxWidth, maxLines) => {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  let consumed = 0;

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      line = candidate;
      consumed += 1;
      continue;
    }
    if (line) lines.push(line);
    if (lines.length === maxLines) break;
    line = word;
    consumed += 1;
  }

  if (line && lines.length < maxLines) lines.push(line);
  if (consumed < words.length && lines.length) {
    const last = lines.length - 1;
    while (lines[last] && context.measureText(`${lines[last]}...`).width > maxWidth) {
      lines[last] = lines[last].slice(0, -1).trim();
    }
    lines[last] = `${lines[last]}...`;
  }
  return lines;
};

const incidentLink = (incident) => {
  const url = new URL('/IncidentDetail', window.location.origin);
  url.searchParams.set('id', incident.id);
  return url.toString();
};

const slug = (value) => String(value || 'evento')
  .toLocaleLowerCase('it-IT')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const drawBrandHeader = async (context) => {
  const logo = await loadFirstImage(['/logo.svg', '/logo.png']);
  if (logo) {
    roundedRect(context, 72, 64, 108, 108, 24);
    context.save();
    context.clip();
    context.drawImage(logo, 72, 64, 108, 108);
    context.restore();
  } else {
    context.fillStyle = '#090d12';
    roundedRect(context, 72, 64, 108, 108, 24);
    context.fill();
    context.strokeStyle = '#10b981';
    context.lineWidth = 7;
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(126, 82);
    context.bezierCurveTo(150, 82, 163, 91, 163, 91);
    context.bezierCurveTo(163, 128, 151, 151, 126, 164);
    context.bezierCurveTo(101, 151, 89, 128, 89, 91);
    context.bezierCurveTo(89, 91, 102, 82, 126, 82);
    context.stroke();
    context.fillStyle = '#10b981';
    context.beginPath();
    context.arc(126, 116, 15, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = '#ffffff';
  context.font = '800 50px Arial, sans-serif';
  context.fillText('SENTINEL', 212, 116);
  context.fillStyle = '#8b95a7';
  context.font = '600 25px Arial, sans-serif';
  context.fillText('NOTIZIE LOCALI, POSIZIONI REALI', 212, 156);
};

const drawPhoto = async (context, type, preferredImageUrl, frame) => {
  const { x, y, width, height } = frame;
  roundedRect(context, x, y, width, height, 34);
  context.save();
  context.clip();
  context.fillStyle = '#111827';
  context.fillRect(x, y, width, height);
  try {
    const photo = await loadImage(preferredImageUrl || FALLBACK_PHOTOS[type] || FALLBACK_PHOTOS.other);
    drawCoverImage(context, photo, x, y, width, height);
  } catch {
    try {
      const fallback = await loadImage('/sentinel_mapbox_3d.jpg');
      drawCoverImage(context, fallback, x, y, width, height);
    } catch {
      context.fillStyle = '#111827';
      context.fillRect(x, y, width, height);
    }
  }
  context.fillStyle = 'rgba(5, 7, 10, 0.34)';
  context.fillRect(x, y, width, height);
  context.restore();
};

const drawCategory = (context, type, accent, y) => {
  context.fillStyle = accent;
  roundedRect(context, 72, y, 300, 66, 16);
  context.fill();
  context.fillStyle = '#05070a';
  context.font = '900 29px Arial, sans-serif';
  context.fillText(TYPE_LABELS[type], 101, y + 44);
};

const drawFooter = (context, incident, height) => {
  const source = incident.source_label || incident.source || 'Fonte verificata';
  context.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(72, height - 230);
  context.lineTo(1008, height - 230);
  context.stroke();

  context.fillStyle = '#8b95a7';
  context.font = '600 24px Arial, sans-serif';
  wrapText(context, `FONTE: ${source}`.toUpperCase(), 936, 1)
    .forEach((line) => context.fillText(line, 72, height - 180));

  context.fillStyle = '#ffffff';
  context.font = '800 35px Arial, sans-serif';
  context.fillText('Segui gli aggiornamenti vicino a te', 72, height - 112);
  context.fillStyle = '#10b981';
  context.font = '900 34px Arial, sans-serif';
  context.fillText('sentinel-italy.vercel.app', 72, height - 58);
};

export const getIncidentShareUrl = incidentLink;

export const createInstagramAssetBlob = async (incident, preferredImageUrl = '', format = 'story') => {
  const layout = SOCIAL_FORMATS[format] || SOCIAL_FORMATS.story;
  const canvas = document.createElement('canvas');
  canvas.width = layout.width;
  canvas.height = layout.height;
  const context = canvas.getContext('2d');
  const resolvedType = resolveIncidentType(incident);
  const type = resolvedType in TYPE_COLORS ? resolvedType : 'other';
  const accent = TYPE_COLORS[type];
  const isStory = format === 'story';

  context.fillStyle = '#05070a';
  context.fillRect(0, 0, layout.width, layout.height);
  context.fillStyle = accent;
  context.fillRect(0, 0, 16, layout.height);

  await drawBrandHeader(context);
  const photoFrame = isStory
    ? { x: 72, y: 225, width: 936, height: 610 }
    : { x: 72, y: 205, width: 936, height: 430 };
  await drawPhoto(context, type, preferredImageUrl, photoFrame);
  drawCategory(context, type, accent, photoFrame.y + photoFrame.height - 92);

  const titleY = photoFrame.y + photoFrame.height + 105;
  context.fillStyle = '#ffffff';
  context.font = `800 ${isStory ? 62 : 54}px Arial, sans-serif`;
  const titleLines = wrapText(context, incident.title, 936, isStory ? 4 : 3);
  const titleLineHeight = isStory ? 74 : 64;
  titleLines.forEach((line, index) => context.fillText(line, 72, titleY + index * titleLineHeight));

  const locationY = titleY + titleLines.length * titleLineHeight + 24;
  const location = incident.address || incident.city || 'Italia';
  context.fillStyle = '#10b981';
  context.font = `800 ${isStory ? 33 : 29}px Arial, sans-serif`;
  wrapText(context, `POSIZIONE  ${location}`, 936, isStory ? 2 : 1)
    .forEach((line, index) => context.fillText(line, 72, locationY + index * 42));

  if (isStory) {
    context.fillStyle = '#cbd5e1';
    context.font = '500 30px Arial, sans-serif';
    wrapText(context, incident.description || 'Aggiornamento verificato dalle fonti Sentinel.', 936, 4)
      .forEach((line, index) => context.fillText(line, 72, locationY + 96 + index * 43));
  }

  drawFooter(context, incident, layout.height);
  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Immagine non disponibile')),
      'image/png',
      0.96,
    );
  });
};

export const createInstagramStoryBlob = (incident, preferredImageUrl = '') => (
  createInstagramAssetBlob(incident, preferredImageUrl, 'story')
);

export const downloadInstagramAsset = (blob, incident, format = 'story') => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `sentinel-${format}-${slug(incident.city || incident.id)}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};

export const downloadInstagramStory = (blob, incident) => (
  downloadInstagramAsset(blob, incident, 'story')
);

export const shareInstagramAsset = async (incident, blob, format = 'story') => {
  const url = incidentLink(incident);
  const label = SOCIAL_FORMATS[format]?.label || 'contenuto';
  const file = new File([blob], `sentinel-instagram-${format}.png`, { type: 'image/png' });
  const caption = `${incident.title}\n${incident.address || incident.city || ''}\n${url}`.trim();

  try {
    await navigator.clipboard?.writeText(caption);
  } catch {
    // Native file sharing remains available without clipboard permission.
  }

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: incident.title, text: caption });
    return 'shared';
  }

  downloadInstagramAsset(blob, incident, format);
  return `${label}-downloaded`;
};

export const shareInstagramStory = (incident, blob) => (
  shareInstagramAsset(incident, blob, 'story')
);

