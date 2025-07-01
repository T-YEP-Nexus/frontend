"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { X, Upload, Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageChange: (imageUrl: string) => void;
  currentImage: string;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onImageChange,
  currentImage,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Images d'avatar par défaut
  const defaultAvatars = [
    "/images/Avatar.png",
    "/images/Avatar.png", // Vous pouvez ajouter d'autres images par défaut
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedImage(avatarUrl);
    setPreviewUrl(avatarUrl);
  };

  const handleSave = () => {
    if (selectedImage) {
      onImageChange(selectedImage);
      onClose();
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Changer l'image de profil
          </h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Prévisualisation */}
          <div className="flex justify-center">
            <div className="relative">
              <Image
                src={previewUrl || currentImage}
                alt="Aperçu"
                width={120}
                height={120}
                className="rounded-full border-4 border-blue-200 shadow-lg"
              />
              {previewUrl && (
                <div className="absolute inset-0 bg-green-500/20 rounded-full flex items-center justify-center">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <User size={16} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload de fichier */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              Télécharger une image
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Glissez-déposez une image ou cliquez pour sélectionner
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
              >
                <Camera className="w-4 h-4 mr-2" />
                Choisir une image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Avatars par défaut */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              Ou choisir un avatar
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {defaultAvatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => handleAvatarSelect(avatar)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    selectedImage === avatar
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button onClick={handleCancel} variant="outline" className="flex-1">
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedImage}
            className="flex-1"
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
