const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024;

export const exportNotesToJson = (notes) => {
  const exportData = notes.map((note) => ({
    title: note.title || '',
    content: note.content || '',
    tags: Array.isArray(note.tags) ? note.tags : [],
  }));

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  const date = new Date().toISOString().slice(0, 10);

  anchor.href = url;
  anchor.download = `notes-export-${date}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
};

export const importNotesFromJson = async (file) => {
  if (!(file instanceof File)) {
    throw new Error('Please select a valid file.');
  }

  if (file.size > MAX_IMPORT_FILE_SIZE) {
    throw new Error('The import file cannot exceed 5 MB.');
  }

  if (
    file.type &&
    file.type !== 'application/json' &&
    !file.name.toLowerCase().endsWith('.json')
  ) {
    throw new Error('Please select a JSON file.');
  }

  const text = await file.text();

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('The selected file contains invalid JSON.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      'The imported file must contain an array of notes.'
    );
  }

  const notes = parsed.map((note, index) => {
    if (
      !note ||
      typeof note !== 'object' ||
      Array.isArray(note)
    ) {
      throw new Error(
        `Invalid note data at item ${index + 1}.`
      );
    }

    const title =
      typeof note.title === 'string'
        ? note.title.trim()
        : '';

    const content =
      typeof note.content === 'string'
        ? note.content
        : '';

    const tags = Array.isArray(note.tags)
      ? note.tags
          .filter((tag) => typeof tag === 'string')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    if (!title || !content.trim()) {
      throw new Error(
        `Note ${index + 1} must contain a title and content.`
      );
    }

    return {
      title,
      content,
      tags,
    };
  });

  return notes;
};