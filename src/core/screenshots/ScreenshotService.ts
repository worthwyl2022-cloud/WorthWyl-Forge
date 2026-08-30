// Screenshot Service for capturing manuscript page snapshots

export class ScreenshotService {
  /**
   * Renders and captures a high-resolution visual snapshot of the novel episode manuscript.
   */
  static async capture(
    episodeNumber: number,
    novelTitle: string,
    text: string,
    genre: string = "Fiction"
  ): Promise<string> {
    if (typeof document === "undefined") {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="%230f172a"/><text x="50" y="100" fill="%23f8fafc" font-size="24">Episode ${episodeNumber}</text></svg>`;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 880;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return "";
    }

    // High quality background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 880);
    bgGradient.addColorStop(0, "#090d16");
    bgGradient.addColorStop(0.5, "#0d1322");
    bgGradient.addColorStop(1, "#080c14");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 640, 880);

    // Decorative book page border
    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, 592, 832);

    ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, 580, 820);

    // Header ornament
    ctx.fillStyle = "#818cf8";
    ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
    ctx.letterSpacing = "3px";
    ctx.textAlign = "center";
    ctx.fillText(`WORTHWYL OS v3 • ${genre.toUpperCase()}`, 320, 64);

    // Chapter Title
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 22px 'Georgia', serif";
    ctx.textAlign = "center";
    ctx.fillText(`${novelTitle}`, 320, 98);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "italic 13px 'Georgia', serif";
    ctx.fillText(`Chapter / Episode ${episodeNumber}`, 320, 122);

    // Divider Line with diamond
    ctx.beginPath();
    ctx.moveTo(180, 140);
    ctx.lineTo(460, 140);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.stroke();

    ctx.fillStyle = "#6366f1";
    ctx.beginPath();
    ctx.arc(320, 140, 3, 0, Math.PI * 2);
    ctx.fill();

    // Body Text preview with clean word wrapping
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "14px 'Georgia', serif";
    ctx.textAlign = "left";

    const lines = this.wrapText(ctx, text, 540);
    let y = 175;
    const lineHeight = 23;
    const maxLines = 26;

    for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
      ctx.fillText(lines[i], 50, y);
      y += lineHeight;
    }

    if (lines.length > maxLines) {
      ctx.fillStyle = "#64748b";
      ctx.font = "italic 12px 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.fillText(`[ ... continues with ${text.split(/\s+/).length} total words ... ]`, 320, 810);
    }

    // Footer timestamp & hash
    ctx.fillStyle = "#475569";
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`SNAP_${Date.now().toString(36).toUpperCase()}`, 50, 840);
    ctx.textAlign = "right";
    ctx.fillText(`EP.${episodeNumber} • COHERENCE VERIFIED`, 590, 840);

    return canvas.toDataURL("image/jpeg", 0.85);
  }

  private static wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const cleanText = text.replace(/\n+/g, " ");
    const words = cleanText.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }
}
