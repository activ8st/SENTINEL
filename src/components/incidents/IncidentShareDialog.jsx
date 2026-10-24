import React, { useEffect, useState } from 'react';
import { Copy, Download, Instagram, LoaderCircle, MessageCircle, RectangleVertical, Share2, Square } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createInstagramAssetBlob,
  downloadInstagramAsset,
  getIncidentShareUrl,
  shareInstagramAsset,
} from '@/lib/instagramStory';

export default function IncidentShareDialog({ incident, imageUrl = '', open, onOpenChange }) {
  const [format, setFormat] = useState('story');
  const [assetBlob, setAssetBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);

  useEffect(() => {
    if (!open || !incident) return undefined;

    let active = true;
    let objectUrl = '';
    setIsPreparing(true);
    createInstagramAssetBlob(incident, imageUrl, format)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setAssetBlob(blob);
        setPreviewUrl(objectUrl);
      })
      .catch(() => toast.error('Impossibile preparare la storia'))
      .finally(() => active && setIsPreparing(false));

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setAssetBlob(null);
      setPreviewUrl('');
    };
  }, [incident, imageUrl, open, format]);

  const handleInstagram = async () => {
    if (!assetBlob) return;
    try {
      const result = await shareInstagramAsset(incident, assetBlob, format);
      toast.success(result === 'shared'
        ? `${format === 'story' ? 'Storia' : 'Post'} pronto. Scegli Instagram dal menu di condivisione.`
        : 'Immagine scaricata e didascalia copiata. Ora pubblicala su Instagram.');
    } catch (error) {
      if (error?.name !== 'AbortError') toast.error('Condivisione non riuscita');
    }
  };

  const handleNativeShare = async () => {
    const url = getIncidentShareUrl(incident);
    try {
      if (navigator.share) {
        await navigator.share({ title: incident.title, text: incident.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copiato negli appunti');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') toast.error('Condivisione non riuscita');
    }
  };

  const handleWhatsApp = () => {
    const url = getIncidentShareUrl(incident);
    const location = incident.address || incident.city || '';
    const message = [incident.title, location, `Leggi e segui gli aggiornamenti su Sentinel: ${url}`]
      .filter(Boolean)
      .join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(getIncidentShareUrl(incident));
    toast.success('Link dell evento copiato');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-lg border-white/10 bg-[#0b0e14] p-5 text-white">
        <DialogHeader className="pr-7 text-left">
          <DialogTitle className="text-lg font-extrabold text-white">Condividi l&apos;evento</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-white/55">
            Crea un contenuto pubblicitario con notizia, posizione, fonte e link a Sentinel.
          </DialogDescription>
        </DialogHeader>

        <div role="group" aria-label="Formato Instagram" className="grid h-11 grid-cols-2 gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            aria-pressed={format === 'story'}
            onClick={() => setFormat('story')}
            className={`flex items-center justify-center gap-2 rounded-md text-xs font-extrabold transition-colors ${format === 'story' ? 'bg-white text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <RectangleVertical className="h-4 w-4" /> Storia 9:16
          </button>
          <button
            type="button"
            aria-pressed={format === 'post'}
            onClick={() => setFormat('post')}
            className={`flex items-center justify-center gap-2 rounded-md text-xs font-extrabold transition-colors ${format === 'post' ? 'bg-white text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <Square className="h-4 w-4" /> Post 4:5
          </button>
        </div>

        <div className={`mx-auto flex items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#05070a] shadow-2xl ${format === 'story' ? 'h-[390px] w-[219px]' : 'h-[338px] w-[270px]'}`}>
          {previewUrl ? (
            <img src={previewUrl} alt="Anteprima storia Instagram Sentinel" className="h-full w-full object-cover" />
          ) : (
            <LoaderCircle className="h-7 w-7 animate-spin text-emerald-400" />
          )}
        </div>

        <button
          type="button"
          disabled={isPreparing || !assetBlob}
          onClick={handleInstagram}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 via-rose-500 to-amber-400 px-4 text-sm font-extrabold text-white transition-opacity disabled:opacity-40"
        >
          {isPreparing ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Instagram className="h-5 w-5" />}
          {format === 'story' ? 'Condividi come Storia' : 'Condividi come Post'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={handleWhatsApp} className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-300 hover:bg-emerald-500/15">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </button>
          <button type="button" onClick={handleNativeShare} className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-white/80 hover:bg-white/10">
            <Share2 className="h-4 w-4" /> Altro
          </button>
          <button type="button" onClick={copyLink} className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-white/80 hover:bg-white/10">
            <Copy className="h-4 w-4" /> Link
          </button>
          <button type="button" disabled={!assetBlob} onClick={() => downloadInstagramAsset(assetBlob, incident, format)} className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-white/80 hover:bg-white/10 disabled:opacity-40">
            <Download className="h-4 w-4" /> Salva
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

