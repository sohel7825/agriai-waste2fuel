/*
 * Vision bridge loaded after app.js.
 * Sends the actual image data URL to /api/analyze when a real API vision key is configured.
 * Falls back to the existing app behavior when vision is unavailable.
 */
(function () {
  function install() {
    if (!window.App || !window.API || typeof window.App.processSelectedFile !== 'function') return;
    if (window.App.__visionBridgeInstalled) return;
    window.App.__visionBridgeInstalled = true;

    const original = window.App.processSelectedFile.bind(window.App);

    window.App.processSelectedFile = async function (file) {
      if (!file || !String(file.type || '').startsWith('image/')) {
        return original(file);
      }

      const previewContainer = document.getElementById('ai-preview-box');
      const previewImg = document.getElementById('ai-preview-img');
      const detectedNameEl = document.getElementById('ai-detected-name');
      const confidenceEl = document.getElementById('ai-confidence-val');
      const confidenceFill = document.getElementById('ai-confidence-fill');
      const traitsEl = document.getElementById('ai-traits-text');
      const overrideDd = document.getElementById('input-waste-type-override');

      if (previewContainer) previewContainer.style.display = 'block';
      if (detectedNameEl) detectedNameEl.textContent = '🤖 AI vision is analyzing your photo...';

      try {
        const imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Could not read image file.'));
          reader.readAsDataURL(file);
        });

        if (previewImg) previewImg.src = imageData;

        const language = window.I18N?.currentLang || 'en';
        const aiRes = await window.API.analyzeBiomassImage({
          filename: file.name,
          mimeType: file.type,
          imageData,
          language
        });

        if (!aiRes?.success) throw new Error(aiRes?.message || 'Image analysis failed.');

        const waste = aiRes.identifiedWaste;
        const locName = window.I18N?.getResidueName(waste.id) || waste.name;
        const confidence = Number(aiRes.confidenceScore) || 0;

        if (detectedNameEl) {
          detectedNameEl.textContent = `${locName} — ${confidence}% confidence`;
        }
        if (confidenceEl) confidenceEl.textContent = `${confidence}%`;
        if (confidenceFill) confidenceFill.style.width = `${confidence}%`;
        if (traitsEl) traitsEl.textContent = aiRes.evidence?.visualReason || waste.simple_desc || aiRes.extractedFeatures?.colorProfile || '';
        if (overrideDd) overrideDd.value = waste.id;

        window.API.showToast(
          aiRes.mode === 'openai-vision'
            ? `AI Vision: ${locName} (${confidence}%)`
            : `Prototype fallback: ${locName} (${confidence}%)`,
          aiRes.mode === 'openai-vision' ? 'success' : 'info'
        );

        window.App.state.selectedImagePayload = {
          filename: file.name,
          mimeType: file.type,
          mode: aiRes.mode,
          wasteId: waste.id
        };
      } catch (error) {
        console.error('Vision analysis error:', error);
        window.API.showToast('AI vision could not analyze this image. Trying the prototype fallback.', 'info');
        return original(file);
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
