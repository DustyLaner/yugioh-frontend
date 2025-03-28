import React, { useEffect, useState } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "./App.css";

function App() {
  const [allCards, setAllCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [visibleCards, setVisibleCards] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Alle");
  const [ownedFilter, setOwnedFilter] = useState("Alle");

  const loadAmount = 20;

  useEffect(() => {
    axios.get("http://192.168.178.100:8000/cards")
      .then((response) => {
        const data = response.data.filter(card => card.image_url);
        setAllCards(data);
      })
      .catch((error) => {
        console.error("Fehler beim Laden der Karten:", error);
      });
  }, []);

  useEffect(() => {
    let filtered = allCards;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "Alle") {
      filtered = filtered.filter(card =>
        card.type.toLowerCase().includes(typeFilter.toLowerCase())
      );
    }

    if (ownedFilter === "Besessen") {
      filtered = filtered.filter(card => card.owned > 0);
    } else if (ownedFilter === "Fehlend") {
      filtered = filtered.filter(card => card.owned === 0);
    }

    setFilteredCards(filtered);
    setVisibleCards(filtered.slice(0, loadAmount));
    setHasMore(filtered.length > loadAmount);
  }, [searchTerm, typeFilter, ownedFilter, allCards]);

  const fetchMoreData = () => {
    const next = filteredCards.slice(
      visibleCards.length,
      visibleCards.length + loadAmount
    );

    setVisibleCards(prev => [...prev, ...next]);

    if (visibleCards.length + next.length >= filteredCards.length) {
      setHasMore(false);
    }
  };

  const updateOwned = (card, change) => {
    const newOwned = Math.max(0, card.owned + change);

    axios.put(`http://192.168.178.100:8000/cards/${card.id}`, {
      owned: newOwned
    })
    .then(() => {
      const updated = allCards.map(c =>
        c.id === card.id ? { ...c, owned: newOwned } : c
      );
      setAllCards(updated);
    })
    .catch(err => {
      console.error("Fehler beim Aktualisieren der Karte:", err);
    });
  };

  return (
    <div className="App">
      <h1>🃏 Yu-Gi-Oh! Kartenübersicht</h1>

      <div className="filter-container">
        <input
          type="text"
          placeholder="Nach Namen suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="Alle">Alle Typen</option>
          <option value="Monster">Monster</option>
          <option value="Spell">Spell</option>
          <option value="Trap">Trap</option>
        </select>

        <select value={ownedFilter} onChange={(e) => setOwnedFilter(e.target.value)}>
          <option value="Alle">Alle Karten</option>
          <option value="Besessen">Nur besessene</option>
          <option value="Fehlend">Nur fehlende</option>
        </select>
      </div>

      <InfiniteScroll
        dataLength={visibleCards.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4 style={{ color: "white" }}>Lade mehr Karten...</h4>}
        endMessage={
          <p style={{ textAlign: "center", color: "gray" }}>
            <b>Alle Karten geladen 👌</b>
          </p>
        }
      >
        <div className="card-grid">
          {visibleCards.map((card) => (
            <div className="card" key={card.id}>
              <LazyLoadImage
                src={card.image_url}
                alt={card.name}
                effect="blur"
                width="100%"
                style={{ borderRadius: "8px" }}
              />
              <h3>{card.name}</h3>
              <p>{card.type}</p>
              <p><strong>ATK:</strong> {card.atk} | <strong>DEF:</strong> {card.def_}</p>
              <div className="counter">
                <button onClick={() => updateOwned(card, -1)} disabled={card.owned <= 0}>−</button>
                <span>{card.owned} im Besitz</span>
                <button onClick={() => updateOwned(card, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}

export default App;

