# postcss-inrule

The one rule to nest them all!

`npm install salsita/postcss-inrule`

`postcss-inrule` is a port of [inStyle](https://github.com/salsita/inStyle) for SASS, giving you an intuitive way to style the current element based on parent variants without repeating complex queries.

https://css-tricks.com/instyle-current-selector-sass/

Just like a nested Media Query, inRule describes its parent element. Configurable special characters are used to easily describe all possible relationships inside its parent tree and produce new selectors.

## Installation

`npm install salsita/postcss-inrule`

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

      @in @.orangered {
        color: orange; // ul div a, ol div a { };
      }

      @in @@.links {
        background: pink; // .links li a { };
      }
    }
  }
}
```

## Options

Special character tags are configurable by passing new options to the plugin.

`{ tagAppend: '<', tagInsert: '\\^', tagReplace: '@' }`
