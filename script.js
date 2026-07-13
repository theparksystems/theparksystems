const tabs = Array.from(document.querySelectorAll(".tab-button"));
const panels = Array.from(document.querySelectorAll(".tab-panel"));
const reportPayload = window.MARKET_REPORTS || { reports: [] };
const funnelPayload = window.MARKET_FUNNEL || { active: false };

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });

    panels.forEach((panel) => {
      panel.classList.remove("active");
      panel.hidden = true;
    });

    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    panel.hidden = false;
    panel.classList.add("active");
  });
});

function feedItem(label, value) {
  return `
    <li>
      <span class="feed-label">${escapeHtml(label)}</span>
      <strong>${escapeHtml(value || "Pending")}</strong>
    </li>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderReportData(payload) {
  const reports = Array.isArray(payload.reports) ? payload.reports : [];
  const latest = reports[0];
  if (!latest) {
    return;
  }

  const state = document.getElementById("analysis-state");
  const marketFeed = document.getElementById("market-feed");
  const predictionFeed = document.getElementById("prediction-feed");
  const reportFeed = document.getElementById("report-feed");

  state.textContent = "LIVE";
  marketFeed.innerHTML = [
    feedItem("Market", latest.market),
    feedItem("Signal brief", latest.summary),
    feedItem("Confidence", latest.confidence),
  ].join("");
  predictionFeed.innerHTML = [
    feedItem("Likely move", latest.prediction),
    feedItem("Window", latest.time_horizon),
    feedItem("Source notes", latest.source_notes),
  ].join("");
  reportFeed.innerHTML = [
    feedItem("Latest report", latest.title),
    feedItem("Posted", latest.posted_at || latest.updated_at),
    feedItem("Archive path", latest.website_path),
  ].join("");
}

renderReportData(reportPayload);

function renderFunnel(payload) {
  if (!payload || !payload.active) {
    return;
  }

  const title = document.getElementById("funnel-title");
  const summary = document.getElementById("funnel-summary");
  const price = document.getElementById("funnel-price");
  const offer = document.getElementById("funnel-offer");
  const audience = document.getElementById("funnel-audience");
  const tiers = document.getElementById("offer-tiers");
  const contact = document.getElementById("contact-instruction");
  const cta = document.getElementById("funnel-cta");

  title.textContent = payload.offer_title || title.textContent;
  summary.textContent = payload.offer_summary || summary.textContent;
  price.textContent = payload.offer_price || price.textContent;
  offer.textContent = payload.source_report_title
    ? `Built from latest public sample: ${payload.source_report_title}`
    : offer.textContent;
  if (Array.isArray(payload.audiences) && payload.audiences.length) {
    audience.innerHTML = payload.audiences.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }
  if (Array.isArray(payload.offer_tiers) && payload.offer_tiers.length) {
    tiers.innerHTML = payload.offer_tiers
      .map((tier) => `<div><strong>${escapeHtml(tier.label)}</strong><span>${escapeHtml(tier.detail)}</span></div>`)
      .join("");
  }
  contact.textContent = payload.contact_instruction || contact.textContent;
  cta.textContent = (payload.cta_label || cta.textContent).toUpperCase();
  cta.href = payload.cta_href || cta.href;
}

renderFunnel(funnelPayload);

const copyWalletButton = document.querySelector(".copy-wallet");
const copyStatus = document.getElementById("copy-status");

if (copyWalletButton && copyStatus) {
  copyWalletButton.addEventListener("click", async () => {
    const wallet = copyWalletButton.dataset.wallet || "";

    try {
      await navigator.clipboard.writeText(wallet);
      copyStatus.textContent = "Wallet copied";
      copyWalletButton.textContent = "COPIED";
      window.setTimeout(() => {
        copyStatus.textContent = "Mainnet receive wallet";
        copyWalletButton.textContent = "COPY";
      }, 1800);
    } catch (error) {
      copyStatus.textContent = wallet;
    }
  });
}
