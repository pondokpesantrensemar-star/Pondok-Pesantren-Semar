
export const compressImage = (file: File, maxWidth = 800, quality = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let currentQuality = quality;
        let currentMaxWidth = maxWidth;
        let dataUrl = '';
        
        const compress = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > currentMaxWidth) {
            height = (currentMaxWidth / width) * height;
            width = currentMaxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          
          // 900KB in base64 is roughly 900,000 characters
          if (dataUrl.length > 900000 && currentQuality > 0.1) {
            currentQuality -= 0.1;
            currentMaxWidth *= 0.8;
            compress();
          } else {
            resolve(dataUrl);
          }
        };
        
        compress();
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
