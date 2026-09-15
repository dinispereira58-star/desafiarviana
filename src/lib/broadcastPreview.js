// Envia o estado ainda não guardado para o <iframe> de pré-visualização do
// site público, para o dono ver o efeito instantaneamente, antes de gravar.
export function broadcastPreview(iframeRef, { activities, settings }) {
  iframeRef.current?.contentWindow?.postMessage(
    { type: 'DESAFIAR_VIANA_PREVIEW_UPDATE', activities, settings },
    '*'
  )
}
