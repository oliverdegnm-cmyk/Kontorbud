"use client";

import { Component } from "react";

export default class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Kortet fejlede:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            borderRadius: 16,
            border: "1.5px solid #E4E8F0",
            height: "100%",
            minHeight: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#5B6478",
            fontSize: 13,
            textAlign: "center",
            padding: 20,
          }}
        >
          Kortet kunne ikke indlæses lige nu. Resten af siden virker stadig.
        </div>
      );
    }
    return this.props.children;
  }
}
