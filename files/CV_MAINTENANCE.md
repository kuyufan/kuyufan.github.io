# Academic CV maintenance

Canonical downloaded PDF: `files/CV_KuYuFan.pdf`
Canonical source of academic records: `enHP.html` (mirrored in `zhHP.html` and `jaHP.html`).
Current PDF update: 2026-10-27.

## Required whenever editing the website

Whenever education, research interests, publications or preprints, presentations, teaching, awards/fellowships, academic service, or patents change:

1. Compare the current English website's academic data against the entries in the static PDF.
2. Rebuild **and replace** `files/CV_KuYuFan.pdf` if any CV-relevant field changed, or verify that the PDF remains accurate if none changed. Replacing the HTML alone does not update the PDF.
3. Check publication status and bibliographic details, sort newest first, and distinguish papers from preprints.
4. Include only actual research presentations in the CV Talks section, not attendance without a presentation. The 2025-03-24 monthly seminar was a blackboard presentation without slides.
5. CV Awards should include the 2024 Japan–Taiwan Exchange Association fellowship and 2019 National Tsing Hua University mathematics scholarship, while the three pre-university awards remain visible on the site but are omitted from the postdoctoral CV.
6. Check that PhD is labeled **expected September 2027** until formally completed.
7. Recheck English PDF text, hyperlinks, typography, page breaks, footers and the direct download link in all three HTML pages.
8. The PDF must be committed **at the same time** as any CV-relevant website update. Avoid on-demand client-side PDF generation; the requested design is static, reliable, no CDN dependency.

The repository deliberately contains no client-side PDF generation code. All three pages link directly to `files/CV_KuYuFan.pdf`.

### Format
A4, modern restrained academic PDF with a date column, linkable publications and talk records, sections for education, publications, preprints, selected talks, fellowships, teaching, academic service and selected patents. Source data must remain grounded in the website and verified academic records.
