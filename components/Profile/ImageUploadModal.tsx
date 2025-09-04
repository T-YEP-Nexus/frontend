"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { X, Upload, Camera, User, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import DevelopmentBadge from "@/components/ui/DevelopmentBadge";

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Images d'avatar par défaut avec les couleurs du site
  const defaultAvatars = [
    {
      url: "/images/Avatar.png",
      color: "from-blue-400 to-blue-600",
      name: "Avatar Principal",
    },
    {
      url: "/images/Avatar.png",
      color: "from-blue-500 to-blue-700",
      name: "Avatar Secondaire",
    },
    {
      url: "/images/Avatar.png",
      color: "from-blue-300 to-blue-500",
      name: "Avatar Tertiaire",
    },
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Header avec dégradé */}
        <div className="relative bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Camera size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Changer l'image de profil</h2>
                <p className="text-blue-100 text-sm">
                  Personnalisez votre apparence
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <DevelopmentBadge>
        {/* Contenu */}
        <div className="p-6 space-y-8">
          {/* Prévisualisation avec animation */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <Image
                src={previewUrl || currentImage}
                alt="Aperçu"
                width={140}
                height={140}
                className="relative rounded-full border-4 border-white shadow-xl ring-4 ring-blue-100 transition-all duration-300 hover:scale-105"
              />
              {previewUrl && (
                <div className="absolute inset-0 bg-green-500/20 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  <div className="bg-green-500 text-white rounded-full p-2 shadow-lg">
                    <Check size={20} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload de fichier avec drag & drop */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">
                Télécharger une image
              </h3>
            </div>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragging
                  ? "border-blue-400 bg-blue-50 scale-105"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Glissez-déposez votre image ici
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  ou cliquez pour sélectionner un fichier
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
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

          {/* Avatars par défaut avec couleurs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">
                Ou choisir un avatar
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {defaultAvatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => handleAvatarSelect(avatar.url)}
                  className={`group relative p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                    selectedImage === avatar.url
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${avatar.color} rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  ></div>
                  <Image
                    src={avatar.url}
                    alt={avatar.name}
                    width={70}
                    height={70}
                    className="relative rounded-full transition-transform duration-300 group-hover:scale-110"
                  />
                  {selectedImage === avatar.url && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 animate-in zoom-in duration-300">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            </div>
          </div>
        </DevelopmentBadge>

        {/* Actions avec style amélioré */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedImage}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Check className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
