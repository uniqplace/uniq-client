// Chat helper functions

export function moveToTop<T extends { _id: string }>(arr: T[], id: string) {
  const i = arr.findIndex((x) => x._id === id);
  if (i > 0) {
    const [x] = arr.splice(i, 1);
    arr.unshift(x);
  }
}

export function upsertThreadArray(threads: any[], incoming: Partial<any> & { _id: string }) {
  const idx = threads.findIndex((t) => t._id === incoming._id);
  if (idx === -1) {
    // Add to top
    const now = new Date().toISOString();
    threads.unshift({
      _id: incoming._id,
      streamCid: incoming.streamCid || '',
      participants: incoming.participants || [],
      peer: incoming.peer ?? null,
      context: incoming.context,
      lastMessageText: incoming.lastMessageText,
      lastMessageAt: incoming.lastMessageAt || now,
      archived: incoming.archived ?? false,
      createdAt: incoming.createdAt || now,
      updatedAt: incoming.updatedAt || now,
    });
  } else {
    // Merge and update
    threads[idx] = {
      ...threads[idx],
      ...incoming,
      participants: incoming.participants ?? threads[idx].participants,
      peer: incoming.peer ?? threads[idx].peer,
      lastMessageAt: incoming.lastMessageAt ?? threads[idx].lastMessageAt,
      lastMessageText: incoming.lastMessageText ?? threads[idx].lastMessageText,
      updatedAt: new Date().toISOString(),
    };
    moveToTop(threads, incoming._id);
  }
}
