import React, { useState, useEffect } from "react";

interface ModalEventFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; start: string; end: string }) => void;
  defaultStart?: string;
  defaultEnd?: string;
}

const ModalEventForm: React.FC<ModalEventFormProps> = ({ open, onClose, onSubmit, defaultStart, defaultEnd }) => {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(defaultStart || "");
  const [end, setEnd] = useState(defaultEnd || "");

  useEffect(() => {
    if (open) {
      setTitle("");
      setStart(defaultStart || "");
      setEnd(defaultEnd || "");
    }
  }, [open, defaultStart, defaultEnd]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Créer un événement</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (title && start && end) {
              onSubmit({ title, start, end });
            }
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            placeholder="Titre de l'événement"
            className="border rounded px-3 py-2"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Début</label>
              <input
                type="datetime-local"
                className="border rounded px-2 py-1 w-full"
                value={start}
                onChange={e => setStart(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Fin</label>
              <input
                type="datetime-local"
                className="border rounded px-2 py-1 w-full"
                value={end}
                onChange={e => setEnd(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="bg-[#1971FF] text-white rounded px-4 py-2 font-semibold hover:bg-[#1450b8]">Créer</button>
        </form>
      </div>
    </div>
  );
};

export default ModalEventForm; 