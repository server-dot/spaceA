/* @ds-bundle: {"format":4,"namespace":"SpaceADesignSystem_8adf46","components":[{"name":"ArticleBody","sourcePath":"components/article/ArticleBody.jsx"},{"name":"ArticleCard","sourcePath":"components/article/ArticleCard.jsx"},{"name":"ArticleGrid","sourcePath":"components/article/ArticleGrid.jsx"},{"name":"ArticleMeta","sourcePath":"components/article/ArticleMeta.jsx"},{"name":"Breadcrumbs","sourcePath":"components/layout/Breadcrumbs.jsx"},{"name":"CategoryGrid","sourcePath":"components/layout/CategoryGrid.jsx"},{"name":"CategoryTile","sourcePath":"components/layout/CategoryTile.jsx"},{"name":"Footer","sourcePath":"components/layout/Footer.jsx"},{"name":"Header","sourcePath":"components/layout/Header.jsx"},{"name":"Hero","sourcePath":"components/layout/Hero.jsx"},{"name":"NAV_ITEMS","sourcePath":"components/layout/Navigation.jsx"},{"name":"Navigation","sourcePath":"components/layout/Navigation.jsx"},{"name":"SearchBar","sourcePath":"components/layout/SearchBar.jsx"},{"name":"Badge","sourcePath":"components/ui/Badge.jsx"},{"name":"Button","sourcePath":"components/ui/Button.jsx"},{"name":"Icon","sourcePath":"components/ui/Icon.jsx"},{"name":"Pagination","sourcePath":"components/ui/Pagination.jsx"}],"sourceHashes":{"components/article/ArticleBody.jsx":"8107324552c2","components/article/ArticleCard.jsx":"d748137a4d7c","components/article/ArticleGrid.jsx":"fb9d6d84e4aa","components/article/ArticleMeta.jsx":"b4a82f26eaca","components/layout/Breadcrumbs.jsx":"6a6f25050272","components/layout/CategoryGrid.jsx":"920fd1ad1677","components/layout/CategoryTile.jsx":"ef922b53efe8","components/layout/Footer.jsx":"e8803d2146ab","components/layout/Header.jsx":"bd1db98e26fd","components/layout/Hero.jsx":"1a6bb452a333","components/layout/Navigation.jsx":"c54e0e4b7275","components/layout/SearchBar.jsx":"6ed0cdc794da","components/ui/Badge.jsx":"969ec59e984d","components/ui/Button.jsx":"e434e3a6b1d5","components/ui/Icon.jsx":"d9de4b64efe6","components/ui/Pagination.jsx":"8184879b4e61","ui_kits/website/Screens.jsx":"519739ff3c1e","ui_kits/website/data.js":"d0495adeb01e"},"inlinedExternals":[],"unexposedExports":[{"name":"formatDate","sourcePath":"components/article/ArticleCard.jsx"}]} */

(() => {

const __ds_ns = (window.SpaceADesignSystem_8adf46 = window.SpaceADesignSystem_8adf46 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/article/ArticleBody.jsx
try { (() => {
// Mirrors the @tailwindcss/typography "prose prose-gray" treatment used by ArticleBody.tsx.
const css = `
.spacea-prose { color: var(--gray-600); font: var(--type-body); max-width: none; }
.spacea-prose > * + * { margin-top: 1.25em; }
.spacea-prose h2 { font-size: var(--text-2xl); line-height: var(--leading-2xl); font-weight: var(--weight-bold); color: var(--text-primary); margin-top: 2em; margin-bottom: 1em; }
.spacea-prose h3 { font-size: var(--text-xl); line-height: var(--leading-xl); font-weight: var(--weight-bold); color: var(--text-primary); margin-top: 1.6em; margin-bottom: 0.6em; }
.spacea-prose a { color: var(--text-link); text-decoration: none; }
.spacea-prose a:hover { text-decoration: underline; }
.spacea-prose img { border-radius: var(--radius-xl); }
.spacea-prose ul, .spacea-prose ol { padding-left: 1.6em; }
.spacea-prose li { margin-top: 0.5em; }
.spacea-prose strong { color: var(--text-primary); font-weight: var(--weight-bold); }
.spacea-prose blockquote { border-left: 4px solid var(--border-default); padding-left: 1em; font-style: italic; color: var(--text-secondary); }
`;
function ArticleBody({
  content,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, css), content ? /*#__PURE__*/React.createElement("div", {
    className: "spacea-prose",
    dangerouslySetInnerHTML: {
      __html: content
    }
  }) : /*#__PURE__*/React.createElement("div", {
    className: "spacea-prose"
  }, children));
}
Object.assign(__ds_scope, { ArticleBody });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/article/ArticleBody.jsx", error: String((e && e.message) || e) }); }

// components/layout/Breadcrumbs.jsx
try { (() => {
function Crumb({
  item,
  isLast,
  onNavigate
}) {
  const [hover, setHover] = React.useState(false);
  if (isLast) return /*#__PURE__*/React.createElement("span", {
    "aria-current": "page",
    style: {
      color: 'var(--text-primary)',
      fontWeight: 'var(--weight-medium)'
    }
  }, item.label);
  return /*#__PURE__*/React.createElement("a", {
    href: item.href,
    onClick: e => {
      if (onNavigate) {
        e.preventDefault();
        onNavigate(item.href);
      }
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      color: hover ? 'var(--text-primary)' : 'var(--text-secondary)',
      textDecoration: 'none',
      transition: 'color var(--duration-fast) var(--ease-default)'
    }
  }, item.label);
}
function Breadcrumbs({
  items = [],
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "\u9EB5\u5305\u5C51",
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("ol", {
    style: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 'var(--space-1)',
      listStyle: 'none',
      margin: 0,
      padding: 0
    }
  }, items.map((item, i) => /*#__PURE__*/React.createElement("li", {
    key: item.href ?? i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)'
    }
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: 'var(--gray-300)'
    }
  }, "/"), /*#__PURE__*/React.createElement(Crumb, {
    item: item,
    isLast: i === items.length - 1,
    onNavigate: onNavigate
  })))));
}
Object.assign(__ds_scope, { Breadcrumbs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Breadcrumbs.jsx", error: String((e && e.message) || e) }); }

// components/layout/CategoryTile.jsx
try { (() => {
function CategoryTile({
  name,
  count,
  image,
  href,
  onNavigate
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onClick: e => {
      if (onNavigate) {
        e.preventDefault();
        onNavigate(href);
      }
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      display: 'block',
      aspectRatio: 'var(--aspect-tile)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      background: 'var(--surface-image-placeholder)',
      boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      transition: 'box-shadow var(--duration-base) var(--ease-default)'
    }
  }, image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: name,
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transform: hover ? 'scale(var(--hover-image-scale))' : 'scale(1)',
      transition: 'transform var(--duration-slow) var(--ease-default)'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to bottom right, var(--brand-400), var(--brand-600))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--overlay-tile)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--white)',
      fontWeight: 600,
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-tight)'
    }
  }, name), count != null && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0.125rem 0 0',
      color: 'rgb(255 255 255 / 0.6)',
      fontSize: 'var(--text-xs)'
    }
  }, count, " \u7BC7")));
}
Object.assign(__ds_scope, { CategoryTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/CategoryTile.jsx", error: String((e && e.message) || e) }); }

// components/layout/CategoryGrid.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function CategoryGrid({
  categories = [],
  title = '瀏覽分類',
  columns = 4,
  onNavigate
}) {
  if (!categories.length) return null;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--space-12) 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-wide)',
      margin: '0 auto',
      padding: '0 var(--gutter-sm)'
    }
  }, title && /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 var(--space-6)',
      font: 'var(--type-block-title)',
      color: 'var(--text-primary)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: 'var(--tile-gap)'
    }
  }, categories.map(c => /*#__PURE__*/React.createElement(__ds_scope.CategoryTile, _extends({
    key: c.slug ?? c.name
  }, c, {
    onNavigate: onNavigate
  }))))));
}
Object.assign(__ds_scope, { CategoryGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/CategoryGrid.jsx", error: String((e && e.message) || e) }); }

// components/layout/Hero.jsx
try { (() => {
function Hero({
  src,
  alt = '推薦好物，用心分享'
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      width: '100%',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      aspectRatio: 'var(--aspect-hero)',
      maxHeight: '600px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center'
    }
  })));
}
Object.assign(__ds_scope, { Hero });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Hero.jsx", error: String((e && e.message) || e) }); }

// components/layout/Navigation.jsx
try { (() => {
const NAV_ITEMS = [{
  label: '關於我們',
  href: '/about'
}, {
  label: '最新消息',
  href: '/news'
}, {
  label: '節慶好禮推薦',
  href: '/holiday-gifts'
}, {
  label: '信用卡攻略',
  href: '/credit-cards'
}];
function NavLink({
  item,
  onNavigate
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: item.href,
    onClick: e => {
      if (onNavigate) {
        e.preventDefault();
        onNavigate(item.href);
      }
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'block',
      padding: 'var(--space-1-5) var(--space-3)',
      font: 'var(--type-label)',
      borderRadius: 'var(--radius-md)',
      color: hover ? 'var(--text-primary)' : 'var(--text-body)',
      background: hover ? 'var(--surface-hover)' : 'transparent',
      transition: 'color var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default)',
      textDecoration: 'none',
      whiteSpace: 'nowrap'
    }
  }, item.label));
}
function Navigation({
  items = NAV_ITEMS,
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "\u4E3B\u9078\u55AE"
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      flexWrap: 'wrap',
      listStyle: 'none',
      margin: 0,
      padding: 0
    }
  }, items.map(item => /*#__PURE__*/React.createElement(NavLink, {
    key: item.href,
    item: item,
    onNavigate: onNavigate
  }))));
}
Object.assign(__ds_scope, { NAV_ITEMS, Navigation });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Navigation.jsx", error: String((e && e.message) || e) }); }

// components/layout/Footer.jsx
try { (() => {
function FooterLink({
  href,
  children,
  onNavigate
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: href,
    onClick: e => {
      if (onNavigate) {
        e.preventDefault();
        onNavigate(href);
      }
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      color: hover ? 'var(--text-inverse-heading)' : 'var(--text-on-inverse)',
      textDecoration: 'none',
      transition: 'color var(--duration-fast) var(--ease-default)'
    }
  }, children));
}
const colHeading = {
  margin: '0 0 var(--space-4)',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  color: 'var(--text-inverse-heading)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--tracking-wider)'
};
const list = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  fontSize: 'var(--text-sm)'
};
function Footer({
  siteName = 'spaceA',
  description = '精選推薦文章，幫你找到最值得的選擇',
  items = __ds_scope.NAV_ITEMS,
  year = new Date().getFullYear(),
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--surface-inverse)',
      color: 'var(--text-on-inverse)',
      marginTop: 'var(--space-16)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-wide)',
      margin: '0 auto',
      padding: 'var(--space-12) var(--gutter-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: 'var(--space-10)',
      marginBottom: 'var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "/",
    onClick: e => {
      if (onNavigate) {
        e.preventDefault();
        onNavigate('/');
      }
    },
    style: {
      font: 'var(--type-block-title)',
      color: 'var(--text-inverse-heading)',
      textDecoration: 'none'
    }
  }, siteName), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-body-sm)',
      color: 'var(--text-inverse-muted)'
    }
  }, description)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: colHeading
  }, "\u5FEB\u901F\u9023\u7D50"), /*#__PURE__*/React.createElement("ul", {
    style: list
  }, items.map(i => /*#__PURE__*/React.createElement(FooterLink, {
    key: i.href,
    href: i.href,
    onNavigate: onNavigate
  }, i.label)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: colHeading
  }, "\u6CD5\u5F8B\u8072\u660E"), /*#__PURE__*/React.createElement("ul", {
    style: list
  }, /*#__PURE__*/React.createElement(FooterLink, {
    href: "/privacy",
    onNavigate: onNavigate
  }, "\u96B1\u79C1\u6B0A\u4FDD\u8B77\u653F\u7B56"), /*#__PURE__*/React.createElement(FooterLink, {
    href: "/contact",
    onNavigate: onNavigate
  }, "\u8207\u6211\u5011\u806F\u7D61")))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: 'var(--border-width) solid var(--border-inverse)',
      paddingTop: 'var(--space-6)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-inverse-faint)',
      textAlign: 'center'
    }
  }, "\xA9 ", year, " ", siteName, ". All rights reserved.")));
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Footer.jsx", error: String((e && e.message) || e) }); }

// components/ui/Badge.jsx
try { (() => {
const style = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: 'var(--space-0-5) var(--space-2-5)',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)',
  lineHeight: 'var(--leading-xs)',
  fontWeight: 'var(--weight-medium)',
  background: 'var(--surface-badge)',
  color: 'var(--text-badge)',
  transition: 'background-color var(--duration-fast) var(--ease-default)',
  textDecoration: 'none',
  width: 'fit-content'
};
function Badge({
  label,
  href,
  children
}) {
  const content = label ?? children;
  const [hover, setHover] = React.useState(false);
  const css = {
    ...style,
    background: href && hover ? 'var(--surface-badge-hover)' : style.background
  };
  if (href) {
    return /*#__PURE__*/React.createElement("a", {
      href: href,
      style: css,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false)
    }, content);
  }
  return /*#__PURE__*/React.createElement("span", {
    style: css
  }, content);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ui/Badge.jsx", error: String((e && e.message) || e) }); }

// components/article/ArticleCard.jsx
try { (() => {
function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
function ArticleCard({
  title,
  excerpt,
  date,
  image,
  imageAlt,
  category,
  href,
  onNavigate
}) {
  const [hover, setHover] = React.useState(false);
  const go = e => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };
  return /*#__PURE__*/React.createElement("article", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      border: 'var(--border-width) solid var(--border-subtle)',
      boxShadow: hover ? 'var(--shadow-md)' : 'none',
      transition: 'box-shadow var(--duration-base) var(--ease-default)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: href,
    onClick: go,
    style: {
      display: 'block',
      position: 'relative',
      aspectRatio: 'var(--aspect-card)',
      background: 'var(--gray-100)',
      overflow: 'hidden'
    }
  }, image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt || title,
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transform: hover ? 'scale(var(--hover-image-scale))' : 'scale(1)',
      transition: 'transform var(--duration-slow) var(--ease-default)'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, var(--gray-200), var(--gray-300))',
      color: 'var(--text-muted)',
      fontSize: 'var(--text-sm)'
    }
  }, "spaceA")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      padding: 'var(--space-5)',
      gap: 'var(--space-2)'
    }
  }, category && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    label: category.name,
    href: category.href
  }), /*#__PURE__*/React.createElement("a", {
    href: href,
    onClick: go,
    style: {
      flex: 1,
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 'var(--space-1) 0 0',
      font: 'var(--type-card-title)',
      color: hover ? 'var(--text-link)' : 'var(--text-primary)',
      transition: 'color var(--duration-fast) var(--ease-default)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, title)), excerpt && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, excerpt), /*#__PURE__*/React.createElement("time", {
    dateTime: date,
    style: {
      marginTop: 'var(--space-1)',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, formatDate(date))));
}
Object.assign(__ds_scope, { formatDate, ArticleCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/article/ArticleCard.jsx", error: String((e && e.message) || e) }); }

// components/article/ArticleGrid.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ArticleGrid({
  posts = [],
  columns = 3,
  emptyLabel = '目前尚無文章。',
  onNavigate
}) {
  if (!posts.length) {
    return /*#__PURE__*/React.createElement("p", {
      style: {
        textAlign: 'center',
        color: 'var(--text-secondary)',
        padding: 'var(--space-16) 0',
        font: 'var(--type-body)'
      }
    }, emptyLabel);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--grid-gap)',
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
    }
  }, posts.map((p, i) => /*#__PURE__*/React.createElement(__ds_scope.ArticleCard, _extends({
    key: p.slug ?? i
  }, p, {
    onNavigate: onNavigate
  }))));
}
Object.assign(__ds_scope, { ArticleGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/article/ArticleGrid.jsx", error: String((e && e.message) || e) }); }

// components/article/ArticleMeta.jsx
try { (() => {
function ArticleMeta({
  author,
  date,
  tags = []
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 'var(--space-3)',
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, author && /*#__PURE__*/React.createElement("span", null, author), author && date && /*#__PURE__*/React.createElement("span", null, "\xB7"), date && /*#__PURE__*/React.createElement("time", {
    dateTime: date
  }, __ds_scope.formatDate(date)), tags.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-1-5)'
    }
  }, tags.map(t => /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    key: t.slug ?? t.name,
    label: t.name
  })))));
}
Object.assign(__ds_scope, { ArticleMeta });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/article/ArticleMeta.jsx", error: String((e && e.message) || e) }); }

// components/ui/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Extracted from the three CTA treatments in the codebase:
// not-found.tsx (solid pill), Pagination.tsx (outline pill), error.tsx (solid rounded-lg).
const VARIANTS = {
  solid: {
    background: 'var(--action-primary)',
    color: 'var(--text-on-brand)',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-full)',
    padding: 'var(--space-2-5) var(--space-5)',
    hover: {
      background: 'var(--action-primary-hover)'
    }
  },
  outline: {
    background: 'transparent',
    color: 'var(--text-link)',
    border: 'var(--border-width) solid var(--border-brand)',
    borderRadius: 'var(--radius-full)',
    padding: 'var(--space-2-5) var(--space-6)',
    hover: {
      background: 'var(--brand-50)'
    }
  },
  accent: {
    background: 'var(--action-accent)',
    color: 'var(--text-on-brand)',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-2-5) var(--space-6)',
    hover: {
      background: 'var(--action-accent-hover)'
    }
  }
};
function Button({
  variant = 'solid',
  href,
  disabled,
  onClick,
  children,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const v = VARIANTS[variant] ?? VARIANTS.solid;
  const css = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    font: 'var(--type-label)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    textDecoration: 'none',
    transition: 'background-color var(--duration-fast) var(--ease-default)',
    background: v.background,
    color: v.color,
    border: v.border,
    borderRadius: v.borderRadius,
    padding: v.padding,
    ...(hover && !disabled ? v.hover : null),
    ...style
  };
  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  };
  if (href) return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    style: css
  }, handlers), children);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    style: css,
    disabled: disabled,
    onClick: onClick
  }, handlers), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ui/Button.jsx", error: String((e && e.message) || e) }); }

// components/ui/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Glyph paths copied verbatim from src/components/layout/SearchBar.tsx.
const PATHS = {
  search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })),
  close: /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  })
};
function Icon({
  name = 'search',
  size = 18,
  strokeWidth = 2,
  style,
  ...rest
}) {
  const glyph = PATHS[name];
  if (!glyph) return null;
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: 'block',
      ...style
    },
    "aria-hidden": "true"
  }, rest), glyph);
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ui/Icon.jsx", error: String((e && e.message) || e) }); }

// components/layout/SearchBar.jsx
try { (() => {
function SearchBar({
  onSearch,
  placeholder = '搜尋文章...'
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [hover, setHover] = React.useState(false);
  const inputRef = React.useRef(null);
  const close = () => {
    setOpen(false);
    setQuery('');
  };
  const submit = e => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch && onSearch(query.trim());
    close();
  };
  if (open) {
    return /*#__PURE__*/React.createElement("form", {
      onSubmit: submit,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-1-5)'
      }
    }, /*#__PURE__*/React.createElement("input", {
      ref: inputRef,
      autoFocus: true,
      type: "text",
      value: query,
      placeholder: placeholder,
      onChange: e => setQuery(e.target.value),
      style: {
        width: '15rem',
        padding: 'var(--space-1-5) var(--space-3)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        border: 'var(--border-width) solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        outline: 'none'
      },
      onFocus: e => {
        e.target.style.boxShadow = '0 0 0 var(--focus-ring-width) var(--focus-ring)';
      },
      onBlur: e => {
        e.target.style.boxShadow = 'none';
        if (!query.trim()) close();
      }
    }), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      "aria-label": "\u641C\u5C0B",
      style: {
        padding: 'var(--space-1-5)',
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary)',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "search",
      size: 18
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "\u95DC\u9589\u641C\u5C0B",
      onClick: close,
      style: {
        padding: 'var(--space-1-5)',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "close",
      size: 16
    })));
  }
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(true),
    "aria-label": "\u641C\u5C0B",
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      padding: 'var(--space-2)',
      borderRadius: 'var(--radius-md)',
      border: 'none',
      cursor: 'pointer',
      color: hover ? 'var(--text-primary)' : 'var(--text-secondary)',
      background: hover ? 'var(--surface-hover)' : 'transparent',
      transition: 'color var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "search",
    size: 18
  }));
}
Object.assign(__ds_scope, { SearchBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/SearchBar.jsx", error: String((e && e.message) || e) }); }

// components/layout/Header.jsx
try { (() => {
function Header({
  siteName = 'spaceA',
  onNavigate,
  onSearch,
  sticky = true
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: sticky ? 'sticky' : 'static',
      top: 0,
      zIndex: 'var(--z-header)',
      background: 'var(--surface-page)',
      borderBottom: 'var(--border-width) solid var(--border-subtle)',
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-wide)',
      margin: '0 auto',
      padding: '0 var(--gutter-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 'var(--header-height)',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "/",
    onClick: e => {
      if (onNavigate) {
        e.preventDefault();
        onNavigate('/');
      }
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      flexShrink: 0,
      font: 'var(--type-block-title)',
      textDecoration: 'none',
      color: hover ? 'var(--text-link)' : 'var(--text-primary)',
      transition: 'color var(--duration-fast) var(--ease-default)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '2rem',
      height: '2rem',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--action-primary)',
      color: 'var(--text-on-brand)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-bold)'
    }
  }, siteName.charAt(0).toUpperCase()), siteName), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Navigation, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(__ds_scope.SearchBar, {
    onSearch: onSearch
  })))));
}
Object.assign(__ds_scope, { Header });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Header.jsx", error: String((e && e.message) || e) }); }

// components/ui/Pagination.jsx
try { (() => {
function Pagination({
  hasNextPage = true,
  onLoadMore,
  loading = false
}) {
  if (!hasNextPage) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 'var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    disabled: loading,
    onClick: onLoadMore
  }, loading ? '載入中...' : '載入更多'));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ui/Pagination.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Screens.jsx
try { (() => {
const {
  Header,
  Footer,
  Hero,
  CategoryGrid,
  ArticleGrid,
  ArticleBody,
  ArticleMeta,
  Breadcrumbs,
  Badge,
  Button,
  Pagination
} = window.SpaceADesignSystem_8adf46;
const D = window.SPACEA_DATA;
const wide = {
  maxWidth: 'var(--container-wide)',
  margin: '0 auto',
  padding: '0 var(--gutter-sm)'
};
const reading = {
  maxWidth: 'var(--container-reading)',
  margin: '0 auto',
  padding: 'var(--space-10) var(--gutter-sm)'
};
function toCard(p, go) {
  return {
    ...p,
    href: `/${p.category.slug}/${p.slug}`,
    category: {
      name: p.category.name,
      href: p.category.href
    }
  };
}
function HomeScreen({
  go
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Hero, {
    src: "../../assets/hero-banner.jpg"
  }), /*#__PURE__*/React.createElement(CategoryGrid, {
    categories: D.categories,
    onNavigate: go
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      ...wide,
      padding: 'var(--space-12) var(--gutter-sm)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 var(--space-6)',
      font: 'var(--type-block-title)',
      color: 'var(--text-primary)'
    }
  }, "\u6700\u65B0\u6587\u7AE0"), /*#__PURE__*/React.createElement(ArticleGrid, {
    posts: D.posts.map(p => toCard(p)),
    columns: 3,
    onNavigate: go
  }), /*#__PURE__*/React.createElement(Pagination, {
    hasNextPage: true,
    onLoadMore: () => {}
  })));
}
function CategoryScreen({
  go,
  slug
}) {
  const cat = D.categories.find(c => c.slug === slug) ?? D.categories[0];
  const posts = D.posts.filter(p => p.category.slug === cat.slug);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...wide,
      padding: 'var(--space-10) var(--gutter-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 'var(--space-8)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(Breadcrumbs, {
    items: [{
      label: '首頁',
      href: '/'
    }, {
      label: cat.name,
      href: cat.href
    }],
    onNavigate: go
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--type-section-title)',
      color: 'var(--text-primary)'
    }
  }, cat.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-body)',
      color: 'var(--text-secondary)'
    }
  }, "\u5171 ", cat.count, " \u7BC7\u7CBE\u9078\u63A8\u85A6\u6587\u7AE0")), /*#__PURE__*/React.createElement(ArticleGrid, {
    posts: posts.map(p => toCard(p)),
    columns: 3,
    onNavigate: go
  }));
}
function ArticleScreen({
  go,
  slug
}) {
  const post = D.posts.find(p => p.slug === slug) ?? D.posts[0];
  return /*#__PURE__*/React.createElement("div", {
    style: reading
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 'var(--space-8)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Breadcrumbs, {
    onNavigate: go,
    items: [{
      label: '首頁',
      href: '/'
    }, {
      label: post.category.name,
      href: post.category.href
    }, {
      label: post.title,
      href: '#'
    }]
  }), /*#__PURE__*/React.createElement("h1", {
    className: "text-balance",
    style: {
      margin: 0,
      font: 'var(--type-page-title)',
      color: 'var(--text-primary)'
    }
  }, post.title), /*#__PURE__*/React.createElement(ArticleMeta, {
    author: post.author,
    date: post.date,
    tags: post.tags
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 'var(--space-10)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: post.image,
    alt: post.title,
    style: {
      width: '100%',
      display: 'block'
    }
  })), /*#__PURE__*/React.createElement(ArticleBody, {
    content: D.articleBody
  }));
}
function SearchScreen({
  go,
  query
}) {
  const q = (query ?? '').trim();
  const posts = q ? D.posts.filter(p => p.title.includes(q) || p.excerpt.includes(q) || p.category.name.includes(q)) : [];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...wide,
      padding: 'var(--space-10) var(--gutter-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--type-section-title)',
      color: 'var(--text-primary)'
    }
  }, q ? `「${q}」的搜尋結果` : '搜尋'), q && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--space-1) 0 0',
      font: 'var(--type-body)',
      color: 'var(--text-secondary)'
    }
  }, "\u5171\u627E\u5230 ", posts.length, " \u7BC7\u6587\u7AE0")), !q ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      font: 'var(--type-body)'
    }
  }, "\u8ACB\u8F38\u5165\u95DC\u9375\u5B57\u641C\u5C0B") : posts.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      font: 'var(--type-body)'
    }
  }, "\u627E\u4E0D\u5230\u76F8\u95DC\u6587\u7AE0\uFF0C\u8A66\u8A66\u5176\u4ED6\u95DC\u9375\u5B57") : /*#__PURE__*/React.createElement(ArticleGrid, {
    posts: posts.map(p => toCard(p)),
    columns: 3,
    onNavigate: go
  }));
}
function StaticScreen({
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-reading)',
      margin: '0 auto',
      padding: 'var(--space-16) var(--gutter-sm)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 var(--space-8)',
      font: 'var(--type-page-title)',
      color: 'var(--text-primary)'
    }
  }, title), /*#__PURE__*/React.createElement(ArticleBody, null, children));
}
function NotFoundScreen({
  go
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...wide,
      padding: 'var(--space-24) var(--gutter-sm)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 var(--space-4)',
      fontSize: 'var(--text-5xl)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--gray-200)'
    }
  }, "404"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 var(--space-3)',
      font: 'var(--type-section-title)',
      color: 'var(--text-primary)'
    }
  }, "\u627E\u4E0D\u5230\u6B64\u9801\u9762"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 var(--space-8)',
      font: 'var(--type-body)',
      color: 'var(--text-secondary)'
    }
  }, "\u4F60\u8981\u627E\u7684\u9801\u9762\u53EF\u80FD\u5DF2\u79FB\u9664\u6216\u7DB2\u5740\u6709\u8AA4\u3002"), /*#__PURE__*/React.createElement(Button, {
    onClick: () => go('/')
  }, "\u56DE\u9996\u9801"));
}
function App() {
  const [route, setRoute] = React.useState({
    name: 'home'
  });
  const go = href => {
    if (href === '/') return setRoute({
      name: 'home'
    });
    if (href === '/about') return setRoute({
      name: 'about'
    });
    if (href === '/privacy') return setRoute({
      name: 'privacy'
    });
    if (href === '/contact') return setRoute({
      name: 'contact'
    });
    const parts = href.replace(/^\//, '').split('/');
    const cat = D.categories.find(c => c.slug === parts[0]);
    if (cat && parts[1]) return setRoute({
      name: 'article',
      slug: parts[1]
    });
    if (cat) return setRoute({
      name: 'category',
      slug: cat.slug
    });
    return setRoute({
      name: 'notfound'
    });
  };
  const search = q => setRoute({
    name: 'search',
    query: q
  });
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);
  let screen;
  if (route.name === 'home') screen = /*#__PURE__*/React.createElement(HomeScreen, {
    go: go
  });else if (route.name === 'category') screen = /*#__PURE__*/React.createElement(CategoryScreen, {
    go: go,
    slug: route.slug
  });else if (route.name === 'article') screen = /*#__PURE__*/React.createElement(ArticleScreen, {
    go: go,
    slug: route.slug
  });else if (route.name === 'search') screen = /*#__PURE__*/React.createElement(SearchScreen, {
    go: go,
    query: route.query
  });else if (route.name === 'about') screen = /*#__PURE__*/React.createElement(StaticScreen, {
    title: "\u95DC\u65BC\u6211\u5011"
  }, /*#__PURE__*/React.createElement("p", null, "spaceA \u662F\u4E00\u500B\u5C08\u696D\u7684\u63A8\u85A6\u6587\u5167\u5BB9\u5E73\u53F0\uFF0C\u7531\u7D93\u9A57\u8C50\u5BCC\u7684 SEO \u5718\u968A\u71DF\u904B\u3002\u6211\u5011\u70BA\u5404\u884C\u5404\u696D\u64B0\u5BEB\u7CBE\u9078\u63A8\u85A6\u6587\u7AE0\uFF0C\u63D0\u4F9B\u6D88\u8CBB\u8005\u6700\u771F\u5BE6\u3001\u6700\u6709\u50F9\u503C\u7684\u53C3\u8003\u8CC7\u8A0A\u3002"), /*#__PURE__*/React.createElement("p", null, "\u7121\u8AD6\u662F 3C \u6578\u4F4D\u7522\u54C1\u3001\u7F8E\u98DF\u9910\u5EF3\u3001\u751F\u6D3B\u5C45\u5BB6\uFF0C\u9084\u662F\u91D1\u878D\u7406\u8CA1\u3001\u5065\u5EB7\u91AB\u7642\uFF0C\u6211\u5011\u90FD\u81F4\u529B\u65BC\u63D0\u4F9B\u6DF1\u5EA6\u3001\u5BA2\u89C0\u7684\u63A8\u85A6\u5167\u5BB9\uFF0C\u5E6B\u52A9\u4F60\u505A\u51FA\u6700\u9069\u5408\u7684\u9078\u64C7\u3002"));else if (route.name === 'privacy') screen = /*#__PURE__*/React.createElement(StaticScreen, {
    title: "\u96B1\u79C1\u6B0A\u4FDD\u8B77\u653F\u7B56"
  }, /*#__PURE__*/React.createElement("p", null, "\u672C\u7AD9\u91CD\u8996\u60A8\u7684\u96B1\u79C1\u6B0A\uFF0C\u4EE5\u4E0B\u8AAA\u660E\u672C\u7DB2\u7AD9\u5982\u4F55\u8490\u96C6\u3001\u4F7F\u7528\u53CA\u4FDD\u8B77\u60A8\u7684\u500B\u4EBA\u8CC7\u8A0A\u3002"), /*#__PURE__*/React.createElement("h2", null, "\u8CC7\u6599\u8490\u96C6"), /*#__PURE__*/React.createElement("p", null, "\u672C\u7AD9\u50C5\u8490\u96C6\u60A8\u4E3B\u52D5\u63D0\u4F9B\u7684\u8CC7\u6599\uFF0C\u4EE5\u53CA\u7DB2\u7AD9\u6D41\u91CF\u5206\u6790\u6240\u9700\u7684\u533F\u540D\u7D71\u8A08\u8CC7\u8A0A\u3002"), /*#__PURE__*/React.createElement("h2", null, "Cookie \u4F7F\u7528"), /*#__PURE__*/React.createElement("p", null, "\u672C\u7AD9\u4F7F\u7528 Google Analytics \u7B49\u5DE5\u5177\u9032\u884C\u6D41\u91CF\u5206\u6790\uFF0C\u76F8\u95DC\u8CC7\u6599\u5747\u70BA\u533F\u540D\u8655\u7406\u3002"));else if (route.name === 'contact') screen = /*#__PURE__*/React.createElement(StaticScreen, {
    title: "\u8207\u6211\u5011\u806F\u7D61"
  }, /*#__PURE__*/React.createElement("p", null, "\u82E5\u60A8\u6709\u4EFB\u4F55\u554F\u984C\u3001\u5408\u4F5C\u63D0\u6848\u6216\u5EE3\u544A\u6D3D\u8A62\uFF0C\u6B61\u8FCE\u8207\u6211\u5011\u806F\u7E6B\u3002"));else screen = /*#__PURE__*/React.createElement(NotFoundScreen, {
    go: go
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement(Header, {
    onNavigate: go,
    onSearch: search
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1
    }
  }, screen), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: go,
    year: 2025
  }));
}
Object.assign(window, {
  App,
  HomeScreen,
  CategoryScreen,
  ArticleScreen,
  SearchScreen,
  NotFoundScreen,
  StaticScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/data.js
try { (() => {
// Sample content in the product's own voice — Traditional Chinese, no emoji, factual headlines.
window.SPACEA_DATA = {
  categories: [{
    slug: '3c',
    name: '3C 數位',
    count: 42,
    image: '../../assets/categories/3c.jpg',
    href: '/3c'
  }, {
    slug: 'food',
    name: '美食餐廳',
    count: 31,
    image: '../../assets/categories/food.jpg',
    href: '/food'
  }, {
    slug: 'health',
    name: '健康醫療',
    count: 18,
    image: '../../assets/categories/health.jpg',
    href: '/health'
  }, {
    slug: 'pets',
    name: '寵物生活',
    count: 12,
    image: '../../assets/categories/pets.jpg',
    href: '/pets'
  }, {
    slug: 'education',
    name: '教育學習',
    count: 9,
    image: '../../assets/categories/education.jpg',
    href: '/education'
  }],
  posts: [{
    slug: 'wireless-earbuds',
    title: '2025 十大無線耳機推薦，通勤與運動都適用',
    excerpt: '從音質、降噪到續航，我們實測十款熱門機種，整理出各種使用情境下最值得入手的選擇。',
    date: '2025-03-14',
    image: '../../assets/categories/3c.jpg',
    category: {
      slug: '3c',
      name: '3C 數位',
      href: '/3c'
    },
    author: '編輯部',
    tags: [{
      name: '開箱'
    }, {
      name: '耳機'
    }]
  }, {
    slug: 'kaohsiung-brunch',
    title: '高雄早午餐精選：六家值得專程一訪的店',
    excerpt: '從老宅咖啡到港式茶點，我們挑出六家餐點穩定、環境舒適的早午餐，週末不踩雷。',
    date: '2025-02-28',
    image: '../../assets/categories/food.jpg',
    category: {
      slug: 'food',
      name: '美食餐廳',
      href: '/food'
    },
    author: '編輯部',
    tags: [{
      name: '高雄'
    }]
  }, {
    slug: 'first-cat',
    title: '第一次養貓要準備什麼？新手用品清單一次看',
    excerpt: '貓砂、飼料、健康檢查與結紮費用，開銷與時程一次算給你看，避免臨時手忙腳亂。',
    date: '2025-01-19',
    image: '../../assets/categories/pets.jpg',
    category: {
      slug: 'pets',
      name: '寵物生活',
      href: '/pets'
    },
    author: '編輯部',
    tags: [{
      name: '新手'
    }]
  }, {
    slug: 'health-check',
    title: '成人健檢怎麼選？四種常見方案比較',
    excerpt: '基礎、進階、影像與癌症篩檢方案差在哪裡，依年齡與家族病史該怎麼挑。',
    date: '2025-01-05',
    image: '../../assets/categories/health.jpg',
    category: {
      slug: 'health',
      name: '健康醫療',
      href: '/health'
    },
    author: '編輯部',
    tags: []
  }, {
    slug: 'online-course',
    title: '線上英文課程推薦：五個平台實際上過的心得',
    excerpt: '師資、課程彈性與價格，我們各上滿一個月後的真實評價。',
    date: '2024-12-22',
    image: '../../assets/categories/education.jpg',
    category: {
      slug: 'education',
      name: '教育學習',
      href: '/education'
    },
    author: '編輯部',
    tags: [{
      name: '線上課程'
    }]
  }, {
    slug: 'air-fryer',
    title: '氣炸鍋值得買嗎？三種家庭情境的實用建議',
    excerpt: '容量、清潔難度與實際使用頻率，決定它會不會變成收納櫃裡的擺設。',
    date: '2024-12-08',
    image: '../../assets/categories/food.jpg',
    category: {
      slug: 'food',
      name: '美食餐廳',
      href: '/food'
    },
    author: '編輯部',
    tags: []
  }],
  articleBody: `
    <p>無線耳機的規格表越來越長，但真正影響日常使用的其實只有幾項。我們花了三週，把十款熱門機種帶進通勤、健身房與辦公室三種情境實測。</p>
    <h2>選購前你該知道的三件事</h2>
    <p>降噪強度、佩戴舒適度與續航力，是決定一副耳機值不值得的關鍵。規格數字漂亮不代表實際體感好，尤其是降噪，過強的降噪在戶外反而會讓人不適。</p>
    <h3>一、降噪不是越強越好</h3>
    <p>捷運與飛機屬於低頻噪音，主動降噪處理得最好；辦公室的人聲則屬中頻，多數機種效果有限。若你主要在室內使用，通透模式的自然度比降噪深度更重要。</p>
    <h3>二、續航要看「含充電盒」的數字</h3>
    <p>官方標示常把耳機本體與充電盒續航混用。實測下來，單次配戴超過六小時的機種只有三款。</p>
    <blockquote>實際配戴兩週後，續航仍是差距最大的一項。</blockquote>
    <h2>結論</h2>
    <p>如果預算在三千元以內，優先考慮佩戴舒適度；五千元以上再把降噪列為主要條件。完整比較表與各機種價格，我們整理在文末表格。</p>
  `
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/data.js", error: String((e && e.message) || e) }); }

__ds_ns.ArticleBody = __ds_scope.ArticleBody;

__ds_ns.ArticleCard = __ds_scope.ArticleCard;

__ds_ns.ArticleGrid = __ds_scope.ArticleGrid;

__ds_ns.ArticleMeta = __ds_scope.ArticleMeta;

__ds_ns.Breadcrumbs = __ds_scope.Breadcrumbs;

__ds_ns.CategoryGrid = __ds_scope.CategoryGrid;

__ds_ns.CategoryTile = __ds_scope.CategoryTile;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.Header = __ds_scope.Header;

__ds_ns.Hero = __ds_scope.Hero;

__ds_ns.NAV_ITEMS = __ds_scope.NAV_ITEMS;

__ds_ns.Navigation = __ds_scope.Navigation;

__ds_ns.SearchBar = __ds_scope.SearchBar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Pagination = __ds_scope.Pagination;

})();
