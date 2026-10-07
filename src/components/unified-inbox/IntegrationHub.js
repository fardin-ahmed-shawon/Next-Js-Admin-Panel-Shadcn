"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Wifi,
  Clock
} from "lucide-react";
import styles from "./IntegrationHub.module.css";

function MessengerIcon({ size = 32 }) {
  return (
    <img 
      src="/messenger.png" 
      alt="Facebook Messenger" 
      width={size} 
      height={size} 
      style={{ width: size, height: size, objectFit: "contain" }} 
    />
  );
}

function InstagramIcon({ size = 32 }) {
  return (
    <img 
      src="/instagram.png" 
      alt="Instagram" 
      width={size} 
      height={size} 
      style={{ width: size, height: size, objectFit: "contain" }} 
    />
  );
}

function WhatsAppIcon({ size = 32 }) {
  return (
    <img 
      src="/whatsapp.png" 
      alt="WhatsApp" 
      width={size} 
      height={size} 
      style={{ width: size, height: size, objectFit: "contain" }} 
    />
  );
}

export default function IntegrationHub({ onChannelChange }) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/unified-inbox/channels");
      const data = await res.json();
      if (data.channels) {
        setChannels(data.channels);
      }
    } catch (err) {
      console.error("Failed to load channels:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Listen for OAuth callback message from popup
  useEffect(() => {
    function handleMessage(event) {
      if (event.data?.type === "FB_OAUTH_SUCCESS") {
        setConnectingPlatform(null);
        setToast({
          type: "success",
          message: "Facebook Page successfully connected! Webhooks are active.",
        });
        fetchChannels();
        if (onChannelChange) onChannelChange();
      } else if (event.data?.type === "IG_OAUTH_SUCCESS") {
        setConnectingPlatform(null);
        setToast({
          type: "success",
          message: "Instagram Account successfully connected! Webhooks are active.",
        });
        fetchChannels();
        if (onChannelChange) onChannelChange();
      } else if (event.data?.type === "FB_OAUTH_ERROR" || event.data?.type === "IG_OAUTH_ERROR") {
        setConnectingPlatform(null);
        setToast({
          type: "error",
          message: event.data.error || "Channel connection was cancelled or failed.",
        });
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [fetchChannels, onChannelChange]);

  const handleConnectFacebook = async () => {
    setConnectingPlatform("meta");
    setToast(null);

    try {
      const res = await fetch("/api/unified-inbox/channels/facebook/auth-url");
      const data = await res.json();

      if (!data.url) {
        throw new Error(data.error || "Could not generate Facebook authorization URL.");
      }

      const width = 640;
      const height = 720;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        data.url,
        "FacebookLoginPopup",
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=1`
      );

      if (!popup) {
        window.location.href = data.url;
      }
    } catch (err) {
      setConnectingPlatform(null);
      setToast({
        type: "error",
        message: err.message || "Failed to start Facebook connection.",
      });
    }
  };

  const handleConnectInstagram = async () => {
    setConnectingPlatform("instagram");
    setToast(null);

    try {
      const res = await fetch("/api/unified-inbox/channels/instagram/auth-url");
      const data = await res.json();

      if (!data.url) {
        throw new Error(data.error || "Could not generate Instagram authorization URL.");
      }

      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        data.url,
        "InstagramLoginPopup",
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=1`
      );

      if (!popup) {
        window.location.href = data.url;
      }
    } catch (err) {
      setConnectingPlatform(null);
      setToast({
        type: "error",
        message: err.message || "Failed to start Instagram connection.",
      });
    }
  };

  const handleDisconnect = async (accountId, accountName, platform) => {
    if (!confirm(`Are you sure you want to disconnect ${accountName}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/unified-inbox/channels?accountId=${encodeURIComponent(accountId)}&platform=${encodeURIComponent(platform)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || data.details || "Failed to disconnect channel.");
      }

      setToast({
        type: "success",
        message: platform === "messenger" || platform === "instagram"
          ? `${accountName} disconnected and its webhook subscription was removed.`
          : `${accountName} disconnected.`,
      });
      fetchChannels();
      if (onChannelChange) onChannelChange();
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to disconnect channel.",
      });
    }
  };

  const connectedFb = channels.find((c) => c.platform === "messenger");
  const connectedIg = channels.find((c) => c.platform === "instagram");

  return (
    <div className={styles.container}>
      <div className={styles.headerWrap}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.mainTitle}>Channels</h1>
            <p className={styles.subtitle}>
              Connect your official Facebook, Instagram, and WhatsApp messaging channels for unified inbox conversations.
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <div className={toast.type === "success" ? styles.toastSuccess : styles.toastError}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className={styles.cardsGrid}>
        {/* 1. Facebook Messenger */}
        <div className={`${styles.card} ${connectedFb ? styles.cardConnected : ""}`}>
          <div className={`${styles.iconWrap} ${styles.iconWrapMessenger}`}>
            <MessengerIcon size={34} />
          </div>
          <h3 className={styles.cardTitle}>Facebook Messenger</h3>
          <p className={styles.cardSubtitle}>Connect Facebook Pages for Customer Chat & Lead Inquiries</p>

          {connectedFb && (
            <div className={styles.connectedStatusRow}>
              <div className={styles.connectedStatusText}>
                <span className={styles.connectedDot} />
                <span>Connected: {connectedFb.account_name}</span>
              </div>
              <button 
                type="button" 
                className={styles.disconnectSmallBtn}
                onClick={() => handleDisconnect(connectedFb.account_id, connectedFb.account_name, connectedFb.platform)}
                title="Disconnect Page"
              >
                Disconnect
              </button>
            </div>
          )}

          <button 
            type="button" 
            className={`${styles.connectBtn} ${connectedFb ? styles.btnConnectedState : ""}`}
            onClick={handleConnectFacebook}
            disabled={connectingPlatform === "meta"}
          >
            {connectingPlatform === "meta" ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Wifi size={15} />
            )}
            <span>{connectedFb ? "Re-connect Facebook" : "Connect"}</span>
          </button>
        </div>

        {/* 2. Instagram Direct */}
        <div className={`${styles.card} ${connectedIg ? styles.cardConnected : ""}`}>
          <div className={`${styles.iconWrap} ${styles.iconWrapInstagram}`}>
            <InstagramIcon size={34} />
          </div>
          <h3 className={styles.cardTitle}>Instagram Direct</h3>
          <p className={styles.cardSubtitle}>Connect Instagram Business Account for Direct Messages & Comments</p>

          {connectedIg && (
            <div className={styles.connectedStatusRow}>
              <div className={styles.connectedStatusText}>
                <span className={styles.connectedDot} />
                <span>Connected: @{connectedIg.account_name}</span>
              </div>
              <button 
                type="button" 
                className={styles.disconnectSmallBtn}
                onClick={() => handleDisconnect(connectedIg.account_id, connectedIg.account_name, connectedIg.platform)}
                title="Disconnect Account"
              >
                Disconnect
              </button>
            </div>
          )}

          <button 
            type="button" 
            className={`${styles.connectBtn} ${connectedIg ? styles.btnConnectedState : ""}`}
            onClick={handleConnectInstagram}
            disabled={connectingPlatform === "instagram"}
          >
            {connectingPlatform === "instagram" ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Wifi size={15} />
            )}
            <span>{connectedIg ? "Re-connect Instagram" : "Connect"}</span>
          </button>
        </div>

        {/* 3. WhatsApp Direct */}
        <div className={styles.card}>
          <div className={`${styles.iconWrap} ${styles.iconWrapWhatsApp}`}>
            <WhatsAppIcon size={34} />
          </div>
          <h3 className={styles.cardTitle}>WhatsApp Direct</h3>
          <p className={styles.cardSubtitle}>Direct WhatsApp Web session & multi-device QR messaging</p>

          <button 
            type="button" 
            className={styles.comingSoonBtn}
            disabled
          >
            <Clock size={15} />
            <span>Coming Soon</span>
          </button>
        </div>
      </div>
    </div>
  );
}
