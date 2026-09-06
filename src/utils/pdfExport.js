import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Mobile-Friendly & Windows-Friendly Direct PDF Export Utility
 * Renders target element seamlessly across mobile devices (iOS Safari, Chrome Android)
 * and Windows desktop browsers with robust fallback download mechanisms.
 */
export async function exportToPdfMobile(element, fileName = 'My_Resume.pdf') {
  if (!element) {
    throw new Error('Element not found for PDF export.');
  }

  // Create container visible to html2canvas but hidden from view
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '794px';
  container.style.minHeight = '1123px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-9999';
  container.style.opacity = '0.99'; // Retains GPU rendering context on mobile Safari
  container.style.pointerEvents = 'none';
  container.style.overflow = 'hidden';

  // Deep clone target resume element
  const clone = element.cloneNode(true);
  clone.style.transform = 'none';
  clone.style.width = '794px';
  clone.style.maxWidth = '794px';
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.display = 'block';
  clone.style.visibility = 'visible';

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // Wait for all images inside clone element to complete loading
    const images = Array.from(clone.querySelectorAll('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete && img.naturalHeight !== 0) {
              resolve();
            } else {
              img.onload = resolve;
              img.onerror = resolve;
            }
          })
      )
    );

    // Brief delay for custom web fonts & Tailwind CSS styles to settle
    await new Promise((resolve) => setTimeout(resolve, 400));

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const renderScale = isMobile ? 2 : 2;

    const canvas = await html2canvas(clone, {
      scale: renderScale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      letterRendering: true,
      scrollY: 0,
      scrollX: 0,
      windowWidth: 794,
      width: 794
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 3) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const safeTitle = (fileName || 'Resume').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const pdfFileName = safeTitle.endsWith('.pdf') ? safeTitle : `${safeTitle}.pdf`;

    // Universal Mobile + Desktop Download Handler using Blob URL & Anchor
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Create temporary link for forced mobile & desktop download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = pdfFileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 1000);

    // Mobile Safari fallback trigger
    if (isMobile) {
      try {
        pdf.save(pdfFileName);
      } catch (err) {
        window.open(blobUrl, '_blank');
      }
    }

    return true;
  } catch (err) {
    console.error('PDF generation error:', err);
    throw err;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}



