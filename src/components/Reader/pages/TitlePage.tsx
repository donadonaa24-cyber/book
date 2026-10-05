interface Props {
  novelTitle: string;
  title: string;
  subtitle?: string;
  author: string;
}

/** 章扉。「第一話　みたらしとおはぎ」のように全角スペースがあれば、話数と題名を分けて組む */
export function TitleContent({ novelTitle, title, subtitle, author }: Props) {
  const [head, ...rest] = title.split("　");
  const name = rest.join("　");
  return (
    <div className="title-page">
      <div className="title-page__novel">{novelTitle}</div>
      <div className="title-page__ornament" aria-hidden="true">
        <span />◆<span />
      </div>
      <h1 className="title-page__chapter">
        {name ? (
          <>
            <span className="title-page__number">{head}</span>
            <span className="title-page__name">{name}</span>
          </>
        ) : (
          <span className="title-page__name">{title}</span>
        )}
      </h1>
      {subtitle && <div className="title-page__subtitle">{subtitle}</div>}
      <div className="title-page__author">著者：{author}</div>
    </div>
  );
}
