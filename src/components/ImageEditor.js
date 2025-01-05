import React, { useState, useRef } from "react";
import Cropper from "react-easy-crop";
import "../css/imageEditor.css";
 

function ImageEditor() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hueRotate, setHueRotate] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [hoverPreview, setHoverPreview] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [finalImageStyle, setFinalImageStyle] = useState({});
  const [showCroppedImage, setShowCroppedImage] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [activeSticker, setActiveSticker] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const fileInputRef = useRef(null);

  const validFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/svg+xml",
  ];

  function handleChange(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile && validFileTypes.includes(selectedFile.type)) {
      handleFile(selectedFile);
    } else {
      alert("Please upload a valid image file (.jpg, .jpeg, .png, .svg)");
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validFileTypes.includes(droppedFile.type)) {
      handleFile(droppedFile);
    } else {
      alert("Please drop a valid image file (.jpg, .jpeg, .png, .svg)");
    }
    setIsDragging(false);
  }

  function handleFile(file) {
    setLoading(true);
    setTimeout(() => {
      setFile(URL.createObjectURL(file));
      setLoading(false);
    }, 1000);
  }

  function removeImage() {
    setFile(null);
    setEditMode(false);
    setShowCroppedImage(false);
    setSelectedSticker(null);
    setActiveSticker(null);
    resetFilters();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const filterStyle = {
    filter: hoverPreview
      ? "none"
      : `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg) sepia(${sepia}%) grayscale(${grayscale}%)`,
  };

  const resetFilters = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHueRotate(0);
    setSepia(0);
    setGrayscale(0);
  };

  const changeBackground = (imageSrc, backgroundColor) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);

      const newImage = canvas.toDataURL("image/png");
    };
  };

  changeBackground("path_to_your_image.png", "darkgrey");

  const getCroppedImg = async (
    imageSrc,
    pixelCrop,
    backgroundColor = "darkgrey"
  ) => {
    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        const base64Image = canvas.toDataURL("image/png");
        resolve(base64Image);
      };
      image.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleNext = async () => {
    if (file && croppedAreaPixels) {
      const croppedImg = await getCroppedImg(file, croppedAreaPixels);
      setCroppedImage(croppedImg);
      setShowCroppedImage(true);

      setFinalImageStyle({
        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg) sepia(${sepia}%) grayscale(${grayscale}%)`,
      });
    }
  };

  const handleBackRepeat = () => {
    setShowCroppedImage(false);
  };

  const handleBack = () => {
    setEditMode(false);
  };

  // const handleDownload = async () => {
  //   if (!croppedImage || !file) return;

  //   const loadImage = (src) => {
  //     return new Promise((resolve, reject) => {
  //       const img = new Image();
  //       img.src = src;
  //       img.crossOrigin = "Anonymous";
  //       img.onload = () => resolve(img);
  //       img.onerror = reject;
  //     });
  //   };

  //   try {
  //     const [bgImage, overlayImage] = await Promise.all([
  //       loadImage(file),
  //       loadImage(croppedImage),
  //     ]);

  //     const finalCanvas = document.createElement("canvas");
  //     const ctx = finalCanvas.getContext("2d");
  //     finalCanvas.width = overlayImage.width;
  //     finalCanvas.height = overlayImage.height;

  //     ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);

  //     ctx.beginPath();
  //     ctx.arc(
  //       overlayImage.width / 2,
  //       overlayImage.height / 2,
  //       overlayImage.width / 2,
  //       0,
  //       Math.PI * 2,
  //       true
  //     );
  //     ctx.closePath();
  //     ctx.clip();

  //     ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg) sepia(${sepia}%) grayscale(${grayscale}%)`;

  //     ctx.drawImage(
  //       overlayImage,
  //       0,
  //       0,
  //       overlayImage.width,
  //       overlayImage.height
  //     );

  //     // Draw the sticker if selected
  //     if (selectedSticker) {
  //       const stickerImage = await loadImage(selectedSticker);
  //       const stickerSize =
  //         Math.min(overlayImage.width, overlayImage.height) / 1; // Adjust size as needed
  //       const stickerX = (overlayImage.width - stickerSize) / 2; // Centering sticker
  //       const stickerY = (overlayImage.height - stickerSize) / 2; // Centering sticker

  //       ctx.drawImage(
  //         stickerImage,
  //         stickerX,
  //         stickerY,
  //         stickerSize,
  //         stickerSize
  //       );
  //     }

  //     const finalImageURL = finalCanvas.toDataURL("image/png");

  //     const link = document.createElement("a");
  //     link.href = finalImageURL;
  //     link.download = "grace_hopper_event.png";
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (error) {
  //     alert("Error loading images for download: " + error);
  //   }
  // };
  const handleDownload = async () => {
    if (!croppedImage || !file) return;

    // Set downloading state
    setIsDownloading(true);

    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
    };

    try {
      const [bgImage, overlayImage] = await Promise.all([
        loadImage(file),
        loadImage(croppedImage),
      ]);

      const finalCanvas = document.createElement("canvas");
      const ctx = finalCanvas.getContext("2d");
      finalCanvas.width = overlayImage.width;
      finalCanvas.height = overlayImage.height;

      ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);

      ctx.beginPath();
      ctx.arc(
        overlayImage.width / 2,
        overlayImage.height / 2,
        overlayImage.width / 2,
        0,
        Math.PI * 2,
        true
      );
      ctx.closePath();
      ctx.clip();

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg) sepia(${sepia}%) grayscale(${grayscale}%)`;

      ctx.drawImage(
        overlayImage,
        0,
        0,
        overlayImage.width,
        overlayImage.height
      );

      // Draw the sticker if selected
      if (selectedSticker) {
        const stickerImage = await loadImage(selectedSticker);
        const stickerSize =
          Math.min(overlayImage.width, overlayImage.height) / 1; // Adjust size as needed
        const stickerX = (overlayImage.width - stickerSize) / 2; // Centering sticker
        const stickerY = (overlayImage.height - stickerSize) / 2; // Centering sticker

        ctx.drawImage(
          stickerImage,
          stickerX,
          stickerY,
          stickerSize,
          stickerSize
        );
      }

      const finalImageURL = finalCanvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = finalImageURL;
      link.download = "grace_hopper_event.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Error loading images for download: " + error);
    } finally {
      // Reset downloading state
      setIsDownloading(false);
    }
  };

  const handleStickerSelect = (sticker) => {
    setSelectedSticker(sticker);
    setActiveSticker(sticker);
  };

  return (
    <div>
      <div className="header">
        <div className="container">
          <div className="header_inner">
            <img
              src={require("../images/logo_dark.png")}
              alt="Logo"
              className="logo"
            />
            <img
              src={require("../images/mewe.png")}
              alt="Logo"
              className="logo"
              style={{ filter: "invert(1)" }}
            />
          </div>
        </div>
      </div>
      <section className="image-editor">
        <div className="container">
          {!editMode ? (
            <div className="upload-section">
              <div
                className={`uploadImage ${isDragging ? "drag-over" : ""}`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!file) {
                    setIsDragging(true);
                  }
                }}
                onDragLeave={() => setIsDragging(false)}
              >
                {!file ? (
                  <div className="upload_content">
                    <p>Drag & Drop Your Image Here</p>
                    <label htmlFor="upload" className="custom-file-input">
                      Upload Image
                    </label>
                    <input
                      id="upload"
                      type="file"
                      onChange={handleChange}
                      ref={fileInputRef}
                    />
                  </div>
                ) : (
                  <>
                    <img
                      src={file}
                      alt="Preview"
                      className={`image-preview ${!loading ? "show" : "hide"}`}
                    />
                    <button className="remove-button" onClick={removeImage}>
                      <i class="fa-solid fa-circle-xmark"></i>
                    </button>
                    <button
                      className="edit-button"
                      onClick={() => setEditMode(true)}
                    >
                      <i class="fa-solid fa-circle-chevron-right"></i>
                    </button>
                  </>
                )}
                {loading && <div className="loader"></div>}
              </div>
            </div>
          ) : !showCroppedImage ? (
            <div className="edit-section">
              <div className="edit-section-inner">
                <div className="edit-image-section">
                  <Cropper
                    image={file}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    zoomWithScroll
                    minZoom={1}
                    maxZoom={4}
                    zoomSpeed={0.05}
                    restrictPosition={true}
                    style={{ containerStyle: filterStyle }}
                  />
                  <button
                    className="reset-button"
                    title="Reset"
                    onClick={resetFilters}
                  >
                    <i class="fa-solid fa-rotate"></i>
                  </button>
                  <button
                    className="preview-button"
                    onMouseEnter={() => setHoverPreview(true)}
                    onMouseLeave={() => setHoverPreview(false)}
                  >
                    <i class="fa-solid fa-eye"></i>
                  </button>
                </div>
                <div className="edit-options">
                  <div className="option_inner">
                    <label>Zoom:</label>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                    />
                  </div>
                  <div className="option_inner">
                    <label>Brightness:</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(e.target.value)}
                    />
                  </div>
                  <div className="option_inner">
                    <label>Contrast:</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(e.target.value)}
                    />
                  </div>
                  <div className="option_inner">
                    <label>Saturation:</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(e.target.value)}
                    />
                  </div>
                  <div className="option_inner">
                    <label>Hue:</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={hueRotate}
                      onChange={(e) => setHueRotate(e.target.value)}
                    />
                  </div>
                  <div className="option_inner">
                    <label>Sepia:</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sepia}
                      onChange={(e) => setSepia(e.target.value)}
                    />
                  </div>
                  <div className="option_inner">
                    <label>Grayscale:</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={grayscale}
                      onChange={(e) => setGrayscale(e.target.value)}
                    />
                  </div>
                </div>
                <div className="button-container">
                  <button className="back-button" onClick={handleBack}>
                    <i class="fa-solid fa-circle-chevron-left"></i>
                  </button>
                  <button className="next-button" onClick={handleNext}>
                    <i class="fa-solid fa-circle-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="download-section">
              <div className="final-preview-page">
                <div className="final-inner-image">
                  {croppedImage && (
                    <img
                      src={croppedImage}
                      alt="Cropped"
                      className="cropped-image"
                      style={finalImageStyle}
                    />
                  )}
                  {selectedSticker && (
                    <img
                      src={selectedSticker}
                      alt="Custom Sticker"
                      className="custom-shape"
                    />
                  )}
                </div>
                <div className="image-sticker">
                  <button
                    onClick={() => handleStickerSelect(null)}
                    style={{
                      border:
                        activeSticker === null
                          ? "2px solid #fea46d"
                          : "2px solid transparent",
                      boxShadow:
                        activeSticker === null
                          ? "0 5px 15px 0 #ee8949"
                          : "0 0 0  0 transparent",
                    }}
                  >
                    <div className="image_position">
                      <img
                        src={croppedImage}
                        alt="Image"
                        style={finalImageStyle}
                      />
                    </div>
                    <h2>Original</h2>
                  </button>
                  <button
                    onClick={() =>
                      handleStickerSelect(
                        require("../images/Advancing inclusion scholar.png")
                      )
                    }
                    style={{
                      border:
                        activeSticker ===
                        require("../images/Advancing inclusion scholar.png")
                          ? "2px solid #fea46d"
                          : "2px solid transparent",
                      boxShadow:
                        activeSticker ===
                        require("../images/Advancing inclusion scholar.png")
                          ? "0 5px 15px 0 #ee8949"
                          : "0 0 0  0 transparent",
                    }}
                  >
                    <div className="image_position">
                      <img
                        src={croppedImage}
                        alt="Image"
                        style={finalImageStyle}
                      />
                      <div className="sticker">
                        <img
                          src={require("../images/Advancing inclusion scholar.png")}
                          alt=""
                        />
                      </div>
                    </div>
                    <h2>Advancing inclusion scholar</h2>
                  </button>
                  <button
                    onClick={() =>
                      handleStickerSelect(
                        require("../images/Hopper volunter.png")
                      )
                    }
                    style={{
                      border:
                        activeSticker ===
                        require("../images/Hopper volunter.png")
                          ? "2px solid #fea46d"
                          : "2px solid transparent",
                      boxShadow:
                        activeSticker ===
                        require("../images/Hopper volunter.png")
                          ? "0 5px 15px 0 #ee8949"
                          : "0 0 0  0 transparent",
                    }}
                  >
                    <div className="image_position">
                      <img
                        src={croppedImage}
                        alt="Image"
                        style={finalImageStyle}
                      />
                      <div className="sticker">
                        <img
                          src={require("../images/Hopper volunter.png")}
                          alt=""
                        />
                      </div>
                    </div>
                    <h2>Hopper volunter</h2>
                  </button>
                  <button
                    onClick={() =>
                      handleStickerSelect(
                        require("../images/I'm Attending.png")
                      )
                    }
                    style={{
                      border:
                        activeSticker === require("../images/I'm Attending.png")
                          ? "2px solid #fea46d"
                          : "2px solid transparent",
                      boxShadow:
                        activeSticker === require("../images/I'm Attending.png")
                          ? "0 5px 15px 0 #ee8949"
                          : "0 0 0  0 transparent",
                    }}
                  >
                    <div className="image_position">
                      <img
                        src={croppedImage}
                        alt="Image"
                        style={finalImageStyle}
                      />
                      <div className="sticker">
                        <img
                          src={require("../images/I'm Attending.png")}
                          alt=""
                        />
                      </div>
                    </div>
                    <h2>I'm Attending</h2>
                  </button>
                  <button
                    onClick={() =>
                      handleStickerSelect(require("../images/I'm speaking.png"))
                    }
                    style={{
                      border:
                        activeSticker === require("../images/I'm speaking.png")
                          ? "2px solid #fea46d"
                          : "2px solid transparent",
                      boxShadow:
                        activeSticker === require("../images/I'm speaking.png")
                          ? "0 5px 15px 0 #ee8949"
                          : "0 0 0  0 transparent",
                    }}
                  >
                    <div className="image_position">
                      <img
                        src={croppedImage}
                        alt="Image"
                        style={finalImageStyle}
                      />
                      <div className="sticker">
                        <img
                          src={require("../images/I'm speaking.png")}
                          alt=""
                        />
                      </div>
                    </div>
                    <h2>I'm speaking At</h2>
                  </button>
                </div>
                <div className="button-container">
                  <button className="back-button" onClick={handleBackRepeat}>
                    <i class="fa-solid fa-circle-chevron-left"></i>
                  </button>
                </div>
              </div>
              <button
                className="download-button"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <span>
                    Downloading...
                    <i className="fa-solid fa-spinner fa-spin"></i>{" "}
                  </span>
                ) : (
                  <span>
                    Download <i className="fa-solid fa-download"></i>
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ImageEditor;
