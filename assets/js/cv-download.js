/*
 * Academic CV generator — GitHub Pages, without a backend.
 * The English HTML page is the canonical source for publications, education,
 * talks, teaching, fellowships and service. Avoid maintaining a separate CV.
 * pdfmake v0.2.20 is loaded on demand when the visitor clicks "Download CV".
 */
(function () {
  "use strict";
  const button = document.getElementById("download-academic-cv");
  if (!button) return;
  const status = document.getElementById("cv-status");
  const PDFMAKE = "https://cdn.jsdelivr.net/npm/pdfmake@0.2.20/build/pdfmake.min.js";
  const VFS = "https://cdn.jsdelivr.net/npm/pdfmake@0.2.20/build/vfs_fonts.js";
  let running = false;

  function setStatus(message) {
    if (status) status.textContent = message;
  }
  function injectScript(src) {
    return new Promise(function (resolve, reject) {
      const el = document.createElement("script");
      el.src = src;
      el.async = true;
      el.onload = resolve;
      el.onerror = function () { reject(new Error("Could not load PDF library.")); };
      document.head.appendChild(el);
    });
  }
  async function loadPdfMake() {
    if (!window.pdfMake) await injectScript(PDFMAKE);
    if (!window.pdfMake || !window.pdfMake.createPdf) throw new Error("PDF library is not available.");
    if (!window.pdfMake.vfs || !Object.keys(window.pdfMake.vfs).length) await injectScript(VFS);
    if (!window.pdfMake.vfs || !Object.keys(window.pdfMake.vfs).length) {
      throw new Error("PDF font library is not available.");
    }
  }
  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").replace(/^[\s·,;:]+|[\s·,;:]+$/g, "").trim();
  }
  function content(element) { return clean(element ? element.textContent : ""); }
  function all(scope, selector) { return Array.from(scope.querySelectorAll(selector)); }
  function section(el) {
    if (!el) return null;
    const parent = el.closest("section");
    return parent || el.parentElement;
  }
  function isTemplate(el) {
    return Boolean(el.closest("template"));
  }
  function latinText(text) {
    return clean(text
      .replace(/格子圖形中的格子直線數/g, "The Number of Lattice Lines in Lattice Figures [in Chinese]")
      .replace(/數學傳播/g, "Mathematical Media [in Chinese]")
      .replace(/(?:范谷瑜|林鳳美|林鳳美)/g, function (name) { return name === "范谷瑜" ? "Ku-Yu Fan" : "Feng-Mei Lin"; })
      .replace(/基礎論特論/g, "Special Topics in Foundations")
      .replace(/志村将也/g, "Masaya Shimura")
      .replace(/[〈〉]/g, "")
      .replace(/[\u3400-\u9fff\uF900-\uFAFF\u3040-\u30ff]/g, " "));
  }
  function pdfHeading(text) {
    return { text: text.toUpperCase(), style: "sectionHeading", margin: [0, 15, 0, 7] };
  }
  function entry(title, detail, link, date) {
    const titlePart = { text: latinText(title), bold: true, color: "#17364B" };
    if (link && /^https?:\/\//.test(link)) {
      titlePart.link = link;
      titlePart.decoration = "underline";
      titlePart.decorationColor = "#a9bbc5";
    }
    const stack = [titlePart];
    if (detail) stack.push({ text: latinText(detail), color: "#495766", margin: [0, 2, 0, 0] });
    return {
      columns: [
        { width: 72, text: clean(date), style: "date" },
        { width: "*", stack: stack }
      ],
      columnGap: 14,
      margin: [0, 0, 0, 8]
    };
  }
  function linkOf(el) {
    const a = el && el.querySelector("a[href]");
    return a ? a.href : "";
  }
  function publishedOrPreprints(source, kind) {
    const heading = source.getElementById(kind);
    if (!heading) return [];
    // Both containers are consecutive sibling h3 + ul elements.
    let list = heading.nextElementSibling;
    while (list && !list.classList.contains("pub-compact")) list = list.nextElementSibling;
    if (!list) return [];
    return all(list, "li").filter(function (li) {
      return !isTemplate(li) && li.querySelector(".pub-title a");
    }).map(function (li) {
      const a = li.querySelector(".pub-title a");
      const title = content(a);
      const authors = content(li.querySelector(".authors"));
      const venue = content(li.querySelector(".venue"));
      const year = content(li.querySelector(".year"));
      const extra = all(li, ".kv").map(content).filter(Boolean).filter(function (x) {
        return !/^(?:PDF|Code|Data)$/.test(x) && !x.startsWith("MSC:");
      }).join("  |  ");
      return entry(title, [authors, venue, extra].filter(Boolean).join(" · "), a.href, year);
    });
  }
  function education(source, expected) {
    const h = source.getElementById("education");
    if (!h) return [];
    let ul = h.nextElementSibling;
    while (ul && !ul.classList.contains("edu")) ul = ul.nextElementSibling;
    if (!ul) return [];
    return all(ul, "li").map(function (li, index) {
      let details = content(li.querySelector(".edu-body"));
      if (index === 0 && expected && !/expected/i.test(details)) {
        details += " (PhD expected " + expected + ")";
      }
      return entry(details, "", "", content(li.querySelector(".edu-year")));
    });
  }
  function selectedTalks(source) {
    const h = source.getElementById("talks-past");
    if (!h) return [];
    let ul = h.nextElementSibling;
    while (ul && !ul.classList.contains("talks")) ul = ul.nextElementSibling;
    if (!ul) return [];
    return all(ul, "li").filter(function (li) {
      return Boolean(li.querySelector(".talk a")) || li.dataset.talk === "true";
    }).map(function (li) {
      const heading = li.querySelector(".talk-title a");
      const when = all(li, ".date time").map(content).filter(Boolean).join("–");
      const where = content(li.querySelector(".place"));
      const talk = li.querySelector(".talk");
      const talkLink = talk && talk.querySelector("a");
      let talkTitle = talkLink ? content(talkLink) : content(talk).replace(/^(?:Talk title|講演題目|演講題目)\s*:\s*/i, "");
      if (/Arborified/.test(talkTitle) && /[\u3400-\u9fff\u3040-\u30ff]/.test(talkTitle)) {
        talkTitle = "A Map Between Arborifications of Multiple Zeta Values (blackboard talk)";
      }
      const desc = [talkTitle, content(heading), where].filter(Boolean).join(" · ");
      return entry(talkTitle || content(heading), [content(heading), where].filter(Boolean).join(" · "), heading ? heading.href : "", when);
    });
  }
  function teaching(source) {
    const h = source.getElementById("courses");
    if (!h) return [];
    let ul = h.nextElementSibling;
    while (ul && !ul.classList.contains("teach-compact")) ul = ul.nextElementSibling;
    if (!ul) return [];
    return all(ul, "li").filter(function (li) {
      return !!li.querySelector(".rowx") && !!li.querySelector(".cell.course");
    }).map(function (li) {
      const course = content(li.querySelector(".course"));
      const uni = content(li.querySelector(".school"));
      const role = content(li.querySelector(".ta"));
      return entry(course, [uni, role].filter(Boolean).join(" · "), "", content(li.querySelector(".yt")));
    });
  }
  function honors(source) {
    return all(source, ".award-item[data-cv='fellowship']").map(function (li) {
      const a = li.querySelector(".edu-body a");
      const details = content(li.querySelector(".award-meta"));
      return entry(a ? content(a) : content(li.querySelector(".edu-body")), details, a ? a.href : "", content(li.querySelector(".edu-year")));
    });
  }
  function service(source) {
    return all(source, ".service-item[data-cv='service']").map(function (li) {
      const a = li.querySelector(".edu-body a");
      const body = content(li.querySelector(".edu-body"));
      return entry(a ? content(a) : body, a ? body.replace(content(a), "").replace(/^\s*[—–-]\s*/, "") : "", a ? a.href : "", content(li.querySelector(".edu-year")));
    });
  }
  function patents(source) {
    const patentSection = source.getElementById("patents");
    if (!patentSection) return [];
    const items = all(patentSection, ".pat-compact li");
    const result = [];
    items.forEach(function (li) {
      const year = content(li.querySelector(".year"));
      const title = content(li.querySelector(".pat-title")).replace(/Approved/g, "");
      const links = all(li, ".pat-links a");
      const taiwan = links.find(function (a) { return /patents\.google\.com/.test(a.href); });
      if (taiwan) {
        const match = taiwan.href.match(/TW(M\d+)/i);
        const label = match ? "Taiwan Utility Model " + match[1].toUpperCase() : "Taiwan mathematics-puzzle patent";
        result.push(entry(label, "Mathematics education / geometric puzzle design; with Wen-Liang Hung", taiwan.href, year));
      }
    });
    // The two granted US patents are also documented in the DC2 application
    // and official patent records; keep their numbers explicit for accurate citation.
    result.push(entry("US Patent 10,322,337 — Hexagonal Prismatic Packing Puzzle",
      "Co-invented with Wen-Liang Hung · Mathematics education",
      "https://patents.google.com/patent/US10322337B2/en", "2019"));
    result.push(entry("US Patent 10,722,782 — Rhombic Dodecahedron Puzzle",
      "Co-invented with Wen-Liang Hung · Mathematics education",
      "https://patents.google.com/patent/US10722782B2/en", "2020"));
    return result;
  }
  function academicCv(source, expected) {
    const groups = [];
    function add(title, elements) {
      if (elements.length) {
        groups.push(pdfHeading(title));
        elements.forEach(function (item) { groups.push(item); });
      }
    }
    const name = "Ku-Yu Fan";
    const markup = source.documentElement.innerHTML;
    const universityEmail = markup.match(/ku-yu\.fan\.d2@math\.nagoya-u\.ac\.jp/i);
    const email = universityEmail ? universityEmail[0] : "ku-yu.fan.d2@math.nagoya-u.ac.jp";
    const siteUrl = new URL("enHP.html", window.location.href).href;
    groups.push({ text: name, style: "name" });
    groups.push({ text: "PhD Candidate in Mathematics · Graduate School of Mathematics, Nagoya University", style: "subtitle" });
    groups.push({
      columns: [
        { text: email, link: "mailto:" + email, color: "#087D83" },
        { text: siteUrl, link: siteUrl, color: "#087D83", alignment: "right" }
      ], margin: [0, 7, 0, 3]
    });
    groups.push({ canvas: [{ type: "line", x1: 0, y1: 0, x2: 500, y2: 0, lineWidth: 1.5, lineColor: "#087D83" }], margin: [0, 6, 0, 3] });
    add("Research Interests", [{ text: "Multiple zeta values; motivic periods and coactions; arborified and Schur multiple zeta values; p-adic multiple zeta values and multiple L-functions.", margin: [0, 0, 0, 6] }]);
    add("Education", education(source, expected));
    add("Published Papers", publishedOrPreprints(source, "pubs-published"));
    add("Preprints", publishedOrPreprints(source, "pubs-arxiv"));
    add("Selected Research Talks", selectedTalks(source));
    add("Fellowships and Awards", honors(source));
    add("Teaching Experience", teaching(source));
    add("Academic Service and Organization", service(source));
    add("Selected Patents — Mathematics Education", patents(source));
    return {
      info: {
        title: "Ku-Yu Fan — Academic Curriculum Vitae",
        author: "Ku-Yu Fan",
        subject: "Academic Curriculum Vitae for postdoctoral applications"
      },
      pageSize: "A4",
      pageMargins: [44, 44, 44, 48],
      content: groups,
      defaultStyle: { font: "Roboto", fontSize: 9.1, lineHeight: 1.2, color: "#1C2935" },
      styles: {
        name: { fontSize: 24, bold: true, color: "#17364B", margin: [0, 0, 0, 4] },
        subtitle: { fontSize: 10, color: "#46576B" },
        sectionHeading: { fontSize: 10.2, bold: true, color: "#087D83", characterSpacing: 0.5 },
        date: { fontSize: 8.4, bold: true, color: "#667788" }
      },
      footer: function (page, count) {
        return { text: "Ku-Yu Fan   ·   " + page + " / " + count, fontSize: 8, color: "#8A99A9", alignment: "right", margin: [44, 0, 44, 0] };
      }
    };
  }
  async function download(event) {
    event.preventDefault();
    if (running) return;
    running = true;
    button.setAttribute("aria-busy", "true");
    setStatus("Preparing the latest academic CV PDF...");
    try {
      // Always read the latest deployed English page. No manual synchronization.
      const path = new URL("enHP.html", window.location.href);
      path.hash = "";
      path.searchParams.set("cv", Date.now().toString());
      const response = await fetch(path.href, { cache: "no-store" });
      if (!response.ok) throw new Error("Cannot load the English website (" + response.status + ").");
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      if (!doc.getElementById("pubs-published") || !doc.getElementById("education")) {
        throw new Error("The academic website data is incomplete.");
      }
      const expected = button.dataset.expectedGraduation || "September 2027";
      const definition = academicCv(doc, expected);
      await loadPdfMake();
      window.pdfMake.createPdf(definition).download("Ku-Yu_Fan_Academic_CV.pdf");
      setStatus("");
    } catch (err) {
      console.error("CV download failed:", err);
      setStatus("PDF generation failed. Please reload the page and try again; your browser must allow the PDF library to load.");
    } finally {
      button.removeAttribute("aria-busy");
      running = false;
    }
  }
  button.addEventListener("click", download);
})();
