import { products } from "@adambelton/shared";

const featuredWriting = [
  {
    title: "Notes from the build",
    excerpt:
      "Early fragments on writing, care, software, and the shape of things being made."
  }
];

export default function HomePage() {
  const [featuredProduct] = products;

  return (
    <main className="home">
      <section className="intro" aria-labelledby="home-title">
        <p className="eyebrow">adambelton.com</p>
        <h1 id="home-title">Writing first. Products close behind.</h1>
        <p className="lede">
          A personal site for published writing, live product demos, and the
          slower work of turning half-formed thoughts into something clearer.
        </p>
      </section>

      <section aria-labelledby="writing-title">
        <h2 className="section-heading" id="writing-title">
          Latest Writing
        </h2>
        <ul className="writing-list">
          {featuredWriting.map((post) => (
            <li className="writing-item" key={post.title}>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>

      {featuredProduct ? (
        <section aria-labelledby="product-title">
          <h2 className="section-heading" id="product-title">
            First Product
          </h2>
          <article className="product-item">
            <h3>{featuredProduct.name}</h3>
            <p>{featuredProduct.summary}</p>
          </article>
        </section>
      ) : null}
    </main>
  );
}
