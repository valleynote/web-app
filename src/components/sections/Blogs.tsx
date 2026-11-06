import Image from "next/image";
import Link from "next/link";
import { assets } from "@/lib/assets";
import { IconArrowUp } from "@/components/Icons";

const posts = [
  {
    title: "Automating Customer Replies",
    excerpt:
      "Learn how AI speeds responses across customer support channels.",
    date: "Sep 12, 2025",
    readTime: "5 min",
    image: assets.blogs[0],
    featured: true,
  },
  {
    title: "Scaling Support Teams",
    excerpt:
      "See how automation helps teams manage growing conversation volumes.",
    date: "Aug 18, 2025",
    readTime: "8 min",
    image: assets.blogs[1],
    featured: false,
  },
  {
    title: "Tracking Chat Performance",
    excerpt:
      "Understand key metrics that improve chatbot results and efficiency.",
    date: "Sep 28, 2025",
    readTime: "6 min",
    image: assets.blogs[2],
    featured: false,
  },
];

export default function Blogs() {
  return (
    <section id="blogs" className="py-16 md:py-24 font-switzer">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-blue">
              Blogs
            </p>
            <h2 className="mt-3 font-inter-tight text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink md:text-[44px]">
              Insights, News & Guides
            </h2>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:mt-14 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.title}
              className={`group flex flex-col overflow-hidden rounded-[24px] border border-bg-border bg-white shadow-[0_16px_50px_rgba(26,26,26,0.06)] transition hover:shadow-[0_20px_60px_rgba(26,26,26,0.1)] ${
                post.featured ? "lg:row-span-1" : ""
              }`}
            >
              <div className="relative aspect-[559/360] overflow-hidden bg-bg-muted">
                <Image
                  src={post.image}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 360px"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 md:p-7">
                <div className="flex items-center gap-3 text-[13px] font-medium text-muted">
                  <time dateTime={post.date.replace(/ /g, "-")}>{post.date}</time>
                  <span className="h-1 w-1 rounded-full bg-bg-border" />
                  <span>{post.readTime}</span>
                </div>
                <h3 className="mt-3 font-inter-tight text-[20px] font-semibold leading-snug tracking-[-0.02em] text-ink">
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">
                  {post.excerpt}
                </p>
                <Link
                  href="#"
                  className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-blue transition group-hover:gap-2"
                >
                  Read Full Blog
                  <IconArrowUp size={14} className="rotate-45" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center md:mt-12">
          <Link
            href="#"
            className="inline-flex rounded-full border border-bg-border bg-white px-8 py-3.5 text-[15px] font-medium text-ink transition hover:bg-bg-muted"
          >
            Load All Blogs
          </Link>
        </div>
      </div>
    </section>
  );
}
