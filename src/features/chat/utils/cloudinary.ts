export function buildAttachmentUrl(secureUrl: string, desiredFileName: string) {
  const extMatch = secureUrl.match(/\.(\w+)(?:\?|#|$)/);
  const ext = extMatch ? extMatch[1] : 'bin';
  const safeBase = (desiredFileName || 'file').replace(/[^\w\-. ]+/g, '_').trim() || 'file';
  const finalName = safeBase.toLowerCase().endsWith(`.${ext}`) ? safeBase : `${safeBase}.${ext}`;
  const encoded = encodeURIComponent(finalName);
  return secureUrl.replace(/\/upload\//, `/upload/fl_attachment:${encoded}/`);
}