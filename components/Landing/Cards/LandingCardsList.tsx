import LandingCards from "./LandingCards";

interface CardData {
  title: string;
  description: string;
  image: string;
}

export default function LandingCardsList({ cards }: { cards: CardData[] }) {
  return (
    <div className="flex flex-wrap gap-8 justify-center py-12 px-6">
      {cards.map((card, index) => (
        <LandingCards
          key={index}
          title={card.title}
          description={card.description}
          image={card.image}
        />
      ))}
    </div>
  );
}
