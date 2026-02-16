import type { Locale } from "@/lib/i18n";
import type { BlogPost } from "@/lib/blog/types";
type BlogArticleBodyProps = {
    post: BlogPost;
    locale: Locale;
};
export function BlogArticleBody({ post, locale }: BlogArticleBodyProps) {
    const localized = post.locale[locale];
    return (<article className="space-y-8 rounded-3xl border border-blacksmith bg-card p-6 sm:p-8">
      <header className="space-y-3">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">
          {localized.title}
        </h1>
        <p className="max-w-3xl text-base leading-8 text-muted-foreground">{localized.excerpt}</p>
      </header>

      <div className="space-y-7">
        {localized.contentBlocks.map((block) => (<section key={block.heading} className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{block.heading}</h2>

            <div className="space-y-4 text-base leading-8 text-muted-foreground">
              {block.paragraphs.map((paragraph) => (<p key={paragraph}>{paragraph}</p>))}
            </div>

            {block.bullets && block.bullets.length > 0 ? (<ul className="list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground marker:text-muted-foreground">
                {block.bullets.map((item) => (<li key={item}>{item}</li>))}
              </ul>) : null}
          </section>))}
      </div>
    </article>);
}

