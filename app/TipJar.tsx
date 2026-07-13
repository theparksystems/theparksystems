"use client";

import { useState } from "react";

const solanaWallet = "FztX9R6gWATozCiECJHxSE59yU7D21tJK2pi84eN4v3k";
const solanaUsdcMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const tipAmounts = ["5", "15", "25"];

function solanaTipLink(amount: string) {
  const params = new URLSearchParams({
    amount,
    "spl-token": solanaUsdcMint,
    label: "The Park Systems",
    message: "Tip jar support",
    memo: "theparksystems-tip-jar",
  });

  return `solana:${solanaWallet}?${params.toString()}`;
}

type TipJarProps = {
  variant?: "panel" | "hero";
};

export function TipJar({ variant = "panel" }: TipJarProps) {
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [walletNote, setWalletNote] = useState("Mainnet receive wallet");

  async function copyWallet() {
    try {
      await navigator.clipboard.writeText(solanaWallet);
      setCopyLabel("Copied");
      setWalletNote("Wallet copied");
      window.setTimeout(() => {
        setCopyLabel("Copy");
        setWalletNote("Mainnet receive wallet");
      }, 1800);
    } catch {
      setWalletNote(solanaWallet);
    }
  }

  return (
    <section className={`tipJar ${variant === "hero" ? "heroTipJar" : ""}`} aria-labelledby="tip-jar-title">
      <div className="tipJarHead">
        <div>
          <p className="panelKicker">SOLANA TIP JAR</p>
          <h3 id="tip-jar-title">Support the cell</h3>
        </div>
        <span>USDC</span>
      </div>
      <p>
        Small support, direct to the receive wallet. No account, checkout, or
        API layer.
      </p>
      <div className="tipActions" aria-label="Preset Solana Pay tips">
        {tipAmounts.map((amount) => (
          <a className="tipButton" href={solanaTipLink(amount)} key={amount}>
            ${amount}
          </a>
        ))}
      </div>
      <div className="walletRow">
        <code>FztX9R...eN4v3k</code>
        <button className="tipButton copyLink" type="button" onClick={copyWallet}>
          {copyLabel}
        </button>
      </div>
      <p className="walletNote" aria-live="polite">
        {walletNote}
      </p>
    </section>
  );
}
