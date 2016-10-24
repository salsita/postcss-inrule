# postcss-inrule

<img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg">

The one rule to nest them all!

https://css-tricks.com/instyle-current-selector-sass/

Just like a nested media query, `inRule` describes its parent element. Configurable special characters are used to easily modify all possible relationships inside its parent tree and produce new selectors.

Also available for [SASS 3.4+](https://github.com/salsita/inStyle).

## Installation

`npm install postcss-inrule`

Needs to be used **before** style unwrappers like `postcss-nested`.

## Append

Appending to one of current element parents is done with the `<` special character. Each additional use of this character targets a higher parent (works the same for all features).

```css
.my-app {
  display: block;

  .widget {
    border-radius: 5px;

    @in <.expanded {
      color: red; // .my-app.expanded .widget { };
    }

    @in <.mobile, <.tablet {
      width: 50vw; // .my-app.mobile .widget, .my-app.tablet .widget { };
    }

    @media (max-width: 768px) {
      float: left;
    }
  }
}
```

## Insert

Inserting a new selector at a certain position above the current element is done with the `^` special character.

```Css
table {
  table-layout: fixed;

  thead {
    font-weight: normal;
  }

  tr {
    height: 30px;

    @in ^thead {
      height: 50px; // table thead tr { };
    }
  }
}
```

## Replace

Replacing a certain selector is done using the `@` character. Multiselectors that become duplicit due to the replacement are removed from the rendered selector.

```Css
ul, ol {
  list-style: none;

  li {
    display: inline-block;

    a {
      text-decoration: underline;

      @in @@.modifier {
        color: orange; // ul .modifier a, ol .modifier a { };
      }

      @in @@.links @span {
        background: pink; // .links span a { };
      }
    }
  }
}
```

## Options

Special character tags are configurable by passing new options to the plugin.

`{ tagAppend: '<', tagInsert: '\\^', tagReplace: '@' }`
