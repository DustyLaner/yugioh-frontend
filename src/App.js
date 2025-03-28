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
  const [filter, setFilter] = useState("all");
  const [cardCounter, setCardCounter] = useState(20);

  useEffect(() => {
    axios.get(`${backendURL}/cards`).then((res) => {
      setAllCards(res.data);
      setDisplayedCards(res.data.slice(0, cardCounter));
    });
  }, [cardCounter]);

  useEffect(() => {
    applyFilters();
  }, [search, filter, allCards]);

  const applyFilters = () => {
    let filtered = allCards;

    if (search) {
      filtered = filtered.filter((card) =>
        card.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter === "owned") {
      filtered = filtered.filter((card) => card.owned > 0);
    } else if (filter === "wishlist") {
      filtered = filtered.filter((card) => card.wishlist);
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

      <select onChange={(e) => setFilter(e.target.value)} value={filter}>
        <option value="all">Alle Karten</option>
        <option value="owned">Besitze ich</option>
        <option value="wishlist">Wunschliste</option>
      </select>

      <p style={{ marginTop: "1rem" }}>
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
          <div key={card.id} style={{ border: "1px solid gray", borderRadius: "10px", padding: "1rem", margin: "1rem", backgroundColor: "#222", width: "200px" }}>
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

