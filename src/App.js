import React, { useEffect, useState } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "./App.css";

const backendURL = "https://yugioh-backend-hhhx.onrender.com";

function App() {
  const [allCards, setAllCards] = useState([]);
  const [displayedCards, setDisplayedCards] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    axios.get(`${backendURL}/cards`).then((res) => {
      setAllCards(res.data);
      setDisplayedCards(res.data.slice(0, cardCounter));
    });
  }, [cardCounter]);

  useEffect(() => {
    applyFilters();
  }, [search, ownershipFilter, typeFilter, allCards]);

  const applyFilters = () => {
    let filtered = allCards;

    if (search) {
      filtered = filtered.filter((card) =>
        card.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (ownershipFilter === "owned") {
      filtered = filtered.filter((card) => card.owned > 0);
    } else if (ownershipFilter === "wishlist") {
      filtered = filtered.filter((card) => card.owned === 0);
    }

    if (typeFilter === "Monster") {
      filtered = filtered.filter((card) => card.type.includes("Monster"));
    } else if (typeFilter !== "all") {
      filtered = filtered.filter((card) => card.type === typeFilter);
    }

    setDisplayedCards(filtered.slice(0, cardCounter));
  };

  const fetchMoreCards = () => {
    if (displayedCards.length >= allCards.length) {
      setHasMore(false);
      return;
    }

    const nextCount = cardCounter + 20;
    setCardCounter(nextCount);
    setDisplayedCards(allCards.slice(0, nextCount));
  };

  const updateOwned = (cardId, newOwned) => {
    axios.put(`${backendURL}/cards/${cardId}`, { owned: newOwned }).then(() => {
      const updated = allCards.map((card) =>
        card.id === cardId ? { ...card, owned: newOwned } : card
      );
      setAllCards(updated);
    });
  };

  return (
    <div className="App" style={{ backgroundColor: "#111", color: "white", padding: "1rem" }}>
      <h1>🃏 Yu-Gi-Oh! Kartenübersicht</h1>

      <input
        type="text"
        placeholder="Karte suchen..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "0.5rem", marginRight: "1rem", width: "250px" }}
      />

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <select onChange={(e) => setOwnershipFilter(e.target.value)} value={ownershipFilter}>
          <option value="all">Alle Karten</option>
          <option value="owned">Im Besitz</option>
          <option value="wishlist">Nicht im Besitz</option>
        </select>

        <select onChange={(e) => setTypeFilter(e.target.value)} value={typeFilter}>
          <option value="all">Alle Typen</option>
          <option value="Monster">Monsterkarten (alle)</option>
          <option value="Normal Monster">Normales Monster</option>
          <option value="Effect Monster">Effektmonster</option>
          <option value="Fusion Monster">Fusionsmonster</option>
          <option value="Ritual Monster">Ritualmonster</option>
          <option value="XYZ Monster">XYZ-Monster</option>
          <option value="Synchro Monster">Synchro-Monster</option>
          <option value="Link Monster">Link-Monster</option>
          <option value="Spell Card">Zauberkarte</option>
          <option value="Trap Card">Fallenkarte</option>
        </select>
      </div>

      <p>
        Angezeigt: <strong>{displayedCards.length}</strong> von <strong>{allCards.length}</strong> Karten
      </p>

      <InfiniteScroll
        dataLength={displayedCards.length}
        next={fetchMoreCards}
        hasMore={hasMore}
        loader={<h4>Mehr Karten werden geladen...</h4>}
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      >
        {displayedCards.map((card) => (
          <div
            key={card.id}
            style={{
              border: "1px solid gray",
              borderRadius: "10px",
              padding: "1rem",
              margin: "1rem",
              backgroundColor: "#222",
              width: "200px",
            }}
          >
            <LazyLoadImage
              src={card.image_url}
              alt={card.name}
              effect="blur"
              width="100%"
            />
            <h3>{card.name}</h3>
            <p>Typ: {card.type}</p>
            <p>{card.desc}</p>
            <p>ATK: {card.atk} | DEF: {card.def_}</p>
            <p>Besitz: {card.owned}</p>
            <button onClick={() => updateOwned(card.id, card.owned + 1)}>+</button>
            <button onClick={() => updateOwned(card.id, Math.max(0, card.owned - 1))}>-</button>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}

export default App;
