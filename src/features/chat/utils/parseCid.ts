

export function parseCid(cid: string): { type: string; id: string } {
  const [type, id] = cid.split(':');
  if (!type || !id) throw new Error('Invalid cid');
  return { type, id };
}


