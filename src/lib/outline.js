// The book. A history of Rust's static analyzers and how they are extended,
// told as dated slides, one per team: Rust project teams (origin: 'project')
// and community tool maintainers (origin: 'community'). Each slide carries a
// `thread` field: that team's part in extending analysis through editions.
//
// `date` is ISO-ish: 'YYYY', 'YYYY-MM', or 'YYYY-MM-DD'. The precision you give
// is the precision displayed. `year` (fractional, for timeline position) and
// `label` (display string) are derived below. Reading order is chronological.
// Inline code uses `backticks`.

const raw = [
  {
    date: '2014-11',
    team: 'Clippy',
    origin: 'project',
    title: 'A bag of lints, loaded as a plugin',
    tldr: 'Clippy began in 2014 as a rustc compiler plugin, the first proof that Rust\'s lint pass could be extended from outside the compiler.',
    gesture: 'Clippy began as a compiler plugin you switched on with `#![plugin(clippy)]`. It was the first proof that rustc\'s lint pass could be extended from outside the compiler.',
    body: 'In November 2014 Manish Goregaokar started rust-clippy as "a collection of lints to give helpful tips to newbies and catch oversights." It hooked into rustc\'s unstable **plugin registrar**, which let a crate hand the compiler extra `LintPass` implementations at build time. That made it nightly-only and tightly coupled to compiler internals: every refactor inside rustc broke it.\n\nClippy eventually stopped being a plugin and became a **driver**. `clippy-driver` wraps `rustc_driver` and registers its passes through compiler callbacks, and it ships version-locked alongside the compiler. That model became the template for every out-of-tree analyzer that followed, from Dylint and Marker to klint and bevy_lint.',
    thread: 'Clippy lints are not gated by edition. They are tuned by an `msrv` setting instead. Extension runs the other way: a lint matures in Clippy and is **uplifted** into rustc, as `drop_ref` became `dropping_references`. Once it lives in rustc, an edition can change its default level.',
    citation: 'rust-clippy README, November 2014.',
    link: 'https://github.com/rust-lang/rust-clippy'
  },
  {
    date: '2015-05-15',
    team: 'Compiler',
    origin: 'project',
    title: 'Lints join the stability promise',
    tldr: 'Rust 1.0 froze the language but declared new lints non-breaking, and the compiler kept its lint machinery unstable.',
    gesture: 'Rust 1.0 froze the language but not the lints. Adding a warning was declared a non-breaking change, and the compiler team kept the lint machinery itself unstable.',
    body: '1.0 shipped four lint levels, `allow`, `warn`, `deny` and `forbid`, settable by attribute or flag. RFC 1105 (API evolution) and RFC 1122 (language semver) defined what counts as breaking, and new lints were explicitly allowed because they only warn.\n\nThere was a catch: a crate with `#![deny(warnings)]` turns every new lint into a build failure. RFC 1193 answered with `--cap-lints`, which lets Cargo cap the lint levels of dependencies so an upstream crate\'s strictness cannot break a downstream build. Plugins stayed nightly-only, were deprecated, and were eventually removed outright. The compiler\'s position was set early: analyzing Rust through rustc\'s internals is permitted, but it is not stable.',
    thread: 'Because lints were non-breaking, the compiler could grow **future-incompatibility lints** that warn about code before its behavior changes. That one decision is the seed of every edition migration that followed.',
    citation: 'RFC 1105, *API evolution*; RFC 1122, *Language semver*; RFC 1193, *Cap lints*, 2015.',
    link: 'https://rust-lang.github.io/rfcs/1193-cap-lints.html'
  },
  {
    date: '2016-09-29',
    team: 'Miri',
    origin: 'project',
    title: 'MIR arrives, and someone runs it',
    tldr: 'Rust 1.12 made MIR the compiler\'s default IR, giving analyzers a small explicit core language, and Miri showed it could be executed.',
    gesture: 'Rust 1.12 made MIR the compiler\'s default IR. Analyzers now had a small, explicit, borrow-checkable core language, and Miri showed it could be executed directly.',
    body: 'MIR (RFC 1211) lowers Rust into a control-flow graph of simple statements, with no sugar, no method resolution left to do, and explicit drops. Rust 1.12 switched code generation to go through MIR by default.\n\nMeanwhile Scott Olson had begun **Miri** as an undergraduate research project at the University of Saskatchewan: an interpreter that walks MIR directly. Oli Scherer joined in 2016, and parts of Miri became the compiler\'s const evaluator, a move completed in early 2018. Today the Miri team maintains it as the reference checker for undefined behavior. It runs test suites while flagging aliasing violations (Stacked and Tree Borrows), out-of-bounds access, uninitialized reads and data races. Miri is dynamic, not static, but it set the bar for what precise analysis of `unsafe` Rust means.',
    thread: 'MIR is **edition-agnostic**. By the time code reaches MIR, edition differences such as closure captures, prelude contents and temporary scopes have already been lowered away. That is the structural reason crates of different editions can coexist in one build, and it is why MIR-level analyzers support every edition for free.',
    citation: 'Rust 1.12 release notes, 2016; Ralf Jung, *The last two years in Miri*, 2022.',
    link: 'https://github.com/rust-lang/miri'
  },
  {
    date: '2017',
    team: 'Core',
    origin: 'project',
    title: 'Epochs, soon renamed editions',
    tldr: 'RFC 2052 let Rust make breaking changes opt-in per crate, with lints and automated fixes as the migration path.',
    gesture: 'RFC 2052 let Rust make breaking changes opt-in per crate, and it made static analysis the way the language evolves.',
    body: 'Aaron Turon\'s RFC proposed **epochs**, renamed **editions** before the first one shipped. Each crate declares an edition, crates of different editions link together freely, and an edition may only make changes that tools can migrate mechanically.\n\nThe RFC made the warn-then-fix pipeline part of the contract. Before an edition changes behavior, the compiler ships lints that flag affected code, and tooling rewrites it using the lints\' suggestions. The core team, which governed the project until the Leadership Council replaced it in 2023, owned that decision.',
    thread: 'The edition contract has three parts: (1) changes must be migratable, (2) migration is driven by lints with machine-applicable suggestions, and (3) editions are chosen per crate. Every later slide is a variation on these three rules.',
    citation: 'Aaron Turon, RFC 2052, *Evolving Rust through epochs*, 2017.',
    link: 'https://rust-lang.github.io/rfcs/2052-epochs.html'
  },
  {
    date: '2018-10-25',
    team: 'Rustfmt',
    origin: 'project',
    title: 'Tools get a namespace',
    tldr: 'Rust 1.30 stabilized tool attributes like #[rustfmt::skip], so code could address tools by name.',
    gesture: 'Rust 1.30 let code address tools by name with `#[rustfmt::skip]`, so the compiler no longer had to know about every attribute a tool might want.',
    body: 'Before RFC 2103, tools hid behind `cfg` tricks: `#[cfg_attr(rustfmt, rustfmt_skip)]`, or `#[cfg_attr(feature = "cargo-clippy", allow(...))]`. The RFC, driven by the needs of rustfmt and Clippy, introduced paths for tool attributes. Rust 1.30 stabilized them, and 1.31 extended the idea to **tool lints** such as `#[allow(clippy::needless_return)]`.\n\nThe list of recognized tools is hard-coded in rustc. The `#![register_tool]` attribute, which would let a third-party analyzer claim its own namespace, remains unstable, so tools outside the project still lack a first-class name.',
    thread: 'Namespaces are what make editions safe for external analyzers. An edition can rename or regroup rustc\'s own lints without ever colliding with names under `clippy::` or `rustdoc::`.',
    citation: 'RFC 2103, *Tool attributes*; Rust 1.30 release notes, 2018.',
    link: 'https://rust-lang.github.io/rfcs/2103-tool-attributes.html'
  },
  {
    date: '2018-12-06',
    team: 'Release',
    origin: 'project',
    title: 'Rust 2018 ships with cargo fix',
    tldr: 'The first edition proved lint-driven migration at scale: cargo fix --edition, compatibility lint groups, and Clippy and rustfmt 1.0.',
    gesture: 'The first edition proved lint-driven migration at scale, with `cargo fix --edition`, an edition lint group, and Clippy and rustfmt reaching 1.0 on stable in the same release.',
    body: 'Rust 1.31 shipped Rust 2018: module path changes, reserved keywords such as `async`, `await`, `dyn` and `try`, and non-lexical lifetimes, which rebuilt the borrow checker as a static analysis over MIR.\n\nMigration ran through `cargo fix`, which applies machine-applicable lint suggestions. Code was migrated by the `rust_2018_compatibility` group and modernized afterwards by `rust_2018_idioms`. In the same release Clippy and rustfmt reached 1.0 as rustup components, and tool lints became stable. The release team\'s six-week train turned all of this into a scheduled launch rather than a flag day.',
    thread: 'This release set the pattern of two lint groups per edition: **compatibility** lints, which you must fix before migrating, and **idiom** lints, which are worth fixing after.',
    citation: '*Announcing Rust 1.31 and Rust 2018*, Rust Blog, 2018-12-06.',
    link: 'https://blog.rust-lang.org/2018/12/06/Rust-1.31-and-rust-2018/'
  },
  {
    date: '2021-05-06',
    team: 'Rustdoc',
    origin: 'project',
    title: 'Documentation becomes an analysis target',
    tldr: 'Rust 1.52 moved rustdoc\'s lints into the rustdoc:: namespace, while rustdoc JSON was turning docs into a machine-readable API model.',
    gesture: 'Rust 1.52 moved rustdoc\'s lints into their own `rustdoc::` namespace. Meanwhile rustdoc\'s JSON output was turning documentation into a machine-readable model of a crate\'s public API.',
    body: 'Intra-doc links stabilized in Rust 1.48, and with them came lints such as `broken_intra_doc_links`. In 1.52 those lints became tool lints, so they are written `rustdoc::broken_intra_doc_links`, and the old names were kept as aliases. The same release fixed the long-standing problem of `cargo check` caching hiding Clippy warnings.\n\nRFC 2963 specified a JSON backend for rustdoc that describes every public item. That turned rustdoc into a front-end other tools can build on, most notably cargo-semver-checks. It is static analysis whose subject is the API itself rather than the code.',
    thread: 'Rustdoc JSON carries its own **format version**, independent of edition. API breakage is measured across crate releases, not across editions, so the format follows the compiler rather than the language edition.',
    citation: 'Rust 1.52.0 release notes, 2021; RFC 2963, *Rustdoc JSON*.',
    link: 'https://releases.rs/docs/1.52.0/'
  },
  {
    date: '2021-10-21',
    team: 'Libs',
    origin: 'project',
    title: 'A new prelude, and a lint to warn about it',
    tldr: 'Rust 2021 added TryFrom, TryInto and FromIterator to the prelude, and shipped a migration lint because the change could make method calls ambiguous.',
    gesture: 'Rust 2021 added `TryFrom`, `TryInto` and `FromIterator` to the prelude. Because that could make existing method calls ambiguous, the library change shipped with its own migration lint.',
    body: 'Adding a trait to the prelude can break code. If a crate defines its own trait with a `try_into` method, a call to that method suddenly has two candidates. So the 2021 prelude is gated by edition, and `rust_2021_prelude_collisions` finds calls that would change meaning and rewrites them into fully qualified syntax.\n\nThe libs team used an even sharper trick for arrays. `IntoIterator for [T; N]` exists in every edition, but method-call syntax in 2015 and 2018 is special-cased to skip it, and the `array_into_iter` lint warns about code that relies on the old behavior. Rust 2021 also brought disjoint closure captures, with a migration lint that inserts `let _ = &x;` where drop order would otherwise change.',
    thread: 'Libs found the second lever. An edition can change **name resolution**, and a library can repair the fallout with a lint. An impl can exist in every edition while the edition decides whether method calls can see it.',
    citation: '*The Rust Edition Guide*, Rust 2021: additions to the prelude.',
    link: 'https://doc.rust-lang.org/edition-guide/rust-2021/prelude.html'
  },
  {
    date: '2022-02-21',
    team: 'rust-analyzer',
    origin: 'project',
    title: 'A second front-end joins the project',
    tldr: 'rust-analyzer joined the Rust organization: an independent, incremental, error-tolerant front-end built for code that is mid-edit.',
    gesture: 'rust-analyzer joined the Rust organization, bringing a second, independent front-end built for incremental, error-tolerant analysis of code that is still being typed.',
    body: 'It began in January 2018 as Aleksey Kladov\'s **libsyntax2** experiment, built on lossless syntax trees (rowan), salsa-based incremental queries, and a parser that recovers from errors instead of stopping. RFC 2912 (2020) planned its takeover from the RLS, and the RLS was deprecated later in 2022.\n\nIt extends analysis differently from rustc. It does not run rustc\'s lints itself. It surfaces `cargo check` and Clippy diagnostics through "flycheck", alongside its own native diagnostics and assists. Its internals are published to crates.io as `ra_ap_*` crates, and it increasingly shares components with rustc, from the lexer to the trait solver, which makes it a library platform for other tools.',
    thread: 'One workspace can mix editions, so rust-analyzer has to understand all of them at once. In its crate graph, **edition is an input of each crate**, which reproduces RFC 2052\'s per-crate model inside the IDE.',
    citation: '*rust-analyzer joins the Rust organization*, Rust Blog, 2022-02-21; RFC 2912.',
    link: 'https://blog.rust-lang.org/2022/02/21/rust-analyzer-joins-rust-org/'
  },
  {
    date: '2022-04-04',
    team: 'Stable MIR / rustc_public',
    origin: 'project',
    title: 'A stable door into the compiler',
    tldr: 'The Stable MIR project, later renamed rustc_public, set out to give analyzers a versioned API over the compiler\'s intermediate representation.',
    gesture: 'The Stable MIR project set out to give analyzers what plugins never had: a versioned API over the compiler\'s intermediate representation.',
    body: 'Verifiers and analyzers such as Kani (AWS), Prusti (ETH Zürich), MIRAI, Creusot and Flux all consume MIR through `rustc_private`. Each one is pinned to a particular nightly and breaks whenever compiler internals change. The project group, led by Celina Val of the Kani team, held its kickoff in April 2022 to build a stable layer in-tree.\n\nA 2025 project goal aimed at publishing a first version on crates.io. The project was then renamed **rustc_public**, because the team concluded that a SemVer-versioned public interface described the goal better than "stable". Until that release, tools use it through the `rustc-dev` rustup component.',
    thread: 'Editions never reach MIR, so a MIR API is edition-proof by construction. The versioning problem it does have is the **compiler version**, which is why it borrows SemVer rather than editions.',
    citation: 'Rust project goals 2025h1, *Publish first version of StableMIR on crates.io*; rustc_public book.',
    link: 'https://rust-lang.github.io/rust-project-goals/2025h1/stable-mir.html'
  },
  {
    date: '2023-01-20',
    team: 'Types',
    origin: 'project',
    title: 'Someone owns the trait solver',
    tldr: 'The types team was chartered to own Rust\'s type system, including the trait solver that every serious analyzer must reimplement or borrow.',
    gesture: 'The types team, with lang and compiler as parent teams, took ownership of the type system, including the trait solver that every serious Rust analyzer has to reimplement or borrow.',
    body: 'Its charter (RFC 3254) and first roadmap set out a next-generation trait solver and **a-mir-formality**, a formal model of the type system, with milestones running through 2027.\n\nTrait resolution is the hardest part of analyzing Rust outside rustc. rust-analyzer first used chalk, then switched to the shared next-generation solver in 2025. That is a rare case of the IDE and the compiler converging on the same analysis code instead of maintaining two approximations of it.',
    thread: 'Type-system changes use both levers. Soundness fixes go through **future-incompatibility lints**, because unsoundness cannot wait three years for an edition. Rust 2024\'s new lifetime-capture rules for `impl Trait`, by contrast, shipped as an edition change with the `impl_trait_overcaptures` migration lint.',
    citation: '*Officially announcing the types team*, Rust Blog, 2023-01-20; RFC 3254.',
    link: 'https://blog.rust-lang.org/2023/01/20/types-announcement/'
  },
  {
    date: '2023-11-16',
    team: 'Cargo',
    origin: 'project',
    title: 'Lint policy moves into Cargo.toml',
    tldr: 'Rust 1.74 added a [lints] table to Cargo.toml, inheritable across a workspace, covering the rustc, clippy and rustdoc namespaces.',
    gesture: 'Rust 1.74 gave lint configuration a home: a `[lints]` table in Cargo.toml that a whole workspace can inherit, covering rustc, Clippy and rustdoc.',
    body: 'Before RFC 3389, lint policy lived in `RUSTFLAGS`, in `.cargo/config.toml`, or in crate-root attributes copied from crate to crate. Now `[lints.rust]`, `[lints.clippy]` and `[lints.rustdoc]` sit next to the dependencies, and `[workspace.lints]` with `lints.workspace = true` makes the policy shared.\n\nCargo had been quietly central to analysis all along. It caps dependency lints (`--cap-lints`, 2015), drives `cargo fix` (2018), and hosts `cargo clippy`. Cargo is now also growing lints of its own, which check manifests rather than code.',
    thread: '`cargo fix --edition` is the engine of every edition migration. With `[lints]`, a project can **stage the next edition** by enabling its compatibility group, such as `rust_2024_compatibility`, long before it flips the edition field.',
    citation: '*Announcing Rust 1.74.0*, Rust Blog, 2023-11-16; RFC 3389.',
    link: 'https://blog.rust-lang.org/2023/11/16/Rust-1.74.0/'
  },
  {
    date: '2024-05-02',
    team: 'Lang',
    origin: 'project',
    title: 'Libraries speak through the compiler',
    tldr: 'Rust 1.78 stabilized #[diagnostic::on_unimplemented], the first stable way for library authors to shape the compiler\'s error messages.',
    gesture: 'The `#[diagnostic]` namespace let library authors shape the compiler\'s error messages. It was the first stable extension point that pushes knowledge into rustc instead of pulling analysis out of it.',
    body: 'RFC 3368 reserved the `diagnostic` attribute namespace, and Rust 1.78 stabilized `#[diagnostic::on_unimplemented]`. A trait can now explain, in its own words, why a type does not implement it. Unknown attributes in the namespace produce warnings rather than errors, so the compiler can add more attributes without breaking anyone. `do_not_recommend` followed.\n\nThe lang team added a second tool for analyzers later that year. `#[expect]` (RFC 2383, Rust 1.81) silences a lint like `allow` does, but it warns if the lint stops firing, so stale suppressions show up in review. Lint attributes also gained a `reason = "..."` field.',
    thread: 'The diagnostic namespace was designed to be **edition-independent**. Its hints are advisory and may be ignored, so rustc can change how it uses them in any release without waiting for an edition.',
    citation: '*Announcing Rust 1.78.0*, Rust Blog, 2024-05-02; RFC 3368; RFC 2383.',
    link: 'https://blog.rust-lang.org/2024/05/02/Rust-1.78.0/'
  },
  {
    date: '2025-02-20',
    team: 'Edition 2024',
    origin: 'project',
    title: 'The largest edition leans on lints',
    tldr: 'Rust 2024 shipped in 1.85 with dozens of migration lints, and for the first time some of them flag what they cannot fix.',
    gesture: 'Rust 2024 leaned harder on static analysis than any edition before it, with migration lints for everything from `unsafe extern` blocks to the drop order of temporaries.',
    body: 'Rust 1.85 shipped the edition. `unsafe_op_in_unsafe_fn` now warns by default, `extern` blocks and attributes such as `#[unsafe(no_mangle)]` must be marked `unsafe`, and references to `static mut` are denied. It also brought new `impl Trait` capture rules, new temporary scopes for `if let` and tail expressions, a reserved `gen` keyword, and an MSRV-aware Cargo resolver, all collected under `rust_2024_compatibility`.\n\nThe edition also exposed the limits of the contract. Lints such as `tail_expr_drop_order` cannot always produce a machine-applicable fix, because whether an earlier drop matters depends on intent. They flag the code for a human to review.',
    thread: 'The contract evolves here, from "everything migrates automatically" to "**migration flags what it cannot fix**." Static analysis now marks where human judgment is needed, as well as rewriting the code it can.',
    citation: '*The Rust Edition Guide*, Rust 2024; *Announcing Rust 1.85.0 and Rust 2024*, 2025-02-20.',
    link: 'https://doc.rust-lang.org/edition-guide/rust-2024/index.html'
  },
  {
    date: '2025-02-20',
    team: 'Style',
    origin: 'project',
    title: 'Formatting gets editions of its own',
    tldr: 'RFC 3338 style editions shipped with Rust 2024, decoupling how rustfmt formats code from which edition the code compiles under.',
    gesture: 'Style editions separated how rustfmt formats code from the language edition the code compiles under, using the same opt-in model.',
    body: 'RFC 3338 ties changes to the default Rust style to editions, so reformatting never arrives unannounced. Code in the 2015, 2018 and 2021 styles keeps formatting the way it always has. `style_edition = "2024"` in rustfmt.toml opts into the new style, and `cargo fmt` infers the style edition from the crate edition in Cargo.toml.\n\nThe 2024 style edition brought long-requested fixes: it stops aligning unrelated trailing comments, removes stray blank lines in `where` clauses, and version-sorts imports. The style team writes the Style Guide and the rustfmt team implements it, which is the same split as between lang and compiler.',
    thread: 'Style editions copy the language-edition model wholesale. They are opt-in, chosen per crate, and **adoptable independently**, so a crate can take the new formatting without changing language editions, or the reverse.',
    citation: 'RFC 3338, *Style evolution*; *The Rust Edition Guide*, Rustfmt: style edition.',
    link: 'https://doc.rust-lang.org/edition-guide/rust-2024/rustfmt-style-edition.html'
  },
  {
    date: '2025-03-26',
    team: 'Spec',
    origin: 'project',
    title: 'Something for verifiers to check against',
    tldr: 'The Rust project adopted the Ferrocene Language Specification, giving verifiers and qualified toolchains a specification to cite.',
    gesture: 'By adopting the Ferrocene Language Specification, the project gave verifiers and qualified toolchains a specification text to check against.',
    body: 'Ferrous Systems wrote the FLS in 2022 for **Ferrocene**, its qualified Rust toolchain for safety-critical and regulated industries. In March 2025 it handed stewardship to the Rust project. Together with the Rust Reference, the FLS forms the basis of an official Rust specification.\n\nFor static analysis this closes a long-open gap. A certification argument needs a document that defines what a program means, and an analyzer that claims to be sound needs something to be sound with respect to. Until now, the only answer was "whatever rustc does."',
    thread: 'A specification has to describe the behavior of **every edition**, so each edition gate becomes a clause in the spec. The spec team is the newest party to the edition contract.',
    citation: '*Adopting the FLS*, Rust Blog, 2025-03-26.',
    link: 'https://blog.rust-lang.org/2025/03/26/adopting-the-fls/'
  },

  // ---- Community tools and project extension points added in the second pass ----

  {
    date: '2017',
    team: 'RustSec',
    origin: 'community',
    title: 'An advisory feed for the dependency graph',
    tldr: 'RustSec and cargo-audit made the dependency graph a target of static checks: match Cargo.lock against a shared database of advisories.',
    gesture: 'cargo-audit analyzes the dependency graph rather than the code. It matches `Cargo.lock` against a shared, community-curated database of advisories.',
    body: 'The RustSec Advisory Database records vulnerabilities, unsound APIs and unmaintained crates as plain files in a git repository. **cargo-audit** reads a lockfile and reports every dependency version an advisory covers. The `rustsec` crate exposes the same data as a library, and the database is exported in real time to OSV and imported by GitHub\'s advisory database.\n\nHere the extension point is the data rather than the tool. Anyone can file an advisory, and every tool that reads the database, including cargo-deny, inherits it. The project is now maintained by the Rust Secure Code Working Group.',
    thread: 'Advisories are keyed to **crate versions**, never to editions. That is a second axis of change running alongside the language: an edition can retire syntax, but only a version bump, guided by advisories, can retire a dependency.',
    citation: 'RustSec Advisory Database; *rustsec* crate documentation.',
    link: 'https://rustsec.org/'
  },
  {
    date: '2019',
    team: 'cargo-deny (Embark Studios)',
    origin: 'community',
    title: 'Policy as a lint on dependencies',
    tldr: 'cargo-deny lints the dependency graph against a deny.toml policy: licenses, banned crates, duplicate versions, untrusted sources and advisories.',
    gesture: 'cargo-deny treats dependency policy as lints. A `deny.toml` file decides which licenses, crates, versions and sources a project accepts, and CI enforces it.',
    body: 'Embark Studios built cargo-deny around four checks. **licenses** verifies every crate\'s license terms against allow and deny lists. **bans** denies specific crates and catches multiple versions of the same crate. **advisories** reads RustSec. **sources** restricts crates to trusted registries and git organizations.\n\nIts extension points are configuration rather than code. A ban can carry a `wrappers` list, so a forbidden crate is still allowed when it comes in through an approved wrapper. The advisories check can read additional advisory databases alongside RustSec, so an organization can publish an internal feed that every project inherits. It is one of the closest things the ecosystem has to an inherited **lineage** of policy.',
    thread: 'cargo-deny gave its own config an edition-like switch. A `version = 2` key in a config section opts into newer defaults without silently changing projects that have not opted in, which is the edition contract applied to a config file.',
    citation: 'EmbarkStudios/cargo-deny, README and book.',
    link: 'https://github.com/EmbarkStudios/cargo-deny'
  },
  {
    date: '2020-12-31',
    team: 'Clippy',
    origin: 'project',
    title: 'Extending Clippy without writing a lint',
    tldr: 'Clippy 1.49 added disallowed_methods: list fully qualified paths in clippy.toml, with a reason, and get a type-resolved diagnostic wherever they are called.',
    gesture: 'Clippy 1.49 added `disallowed_methods`. You list paths in `clippy.toml` and get a type-checked diagnostic, with your own reason, everywhere one is called.',
    body: 'This is Clippy\'s main extension point that needs no Rust code. In `clippy.toml`, `disallowed-methods` takes fully qualified paths. An entry can be a plain string or a table with `path` and `reason`, and newer releases add `replacement`. TiKV, for example, bans `time::now` with the reason "unsound, see RUSTSEC-2020-0071". Sibling lints such as `disallowed_types` and `disallowed_macros` work the same way, and newer Clippy supports per-module profiles with different lists.\n\nThe key property is that matching is **type-resolved**. When Clippy flags a `.timestamp()` call, it knows the call resolves to `chrono::NaiveDateTime::timestamp`, not to an unrelated method with the same name. That is the difference from syntactic tools such as ast-grep. The trade-off is that `clippy.toml` itself is documented as unstable, and the list cannot be pulled in from a published crate.',
    thread: '`#[deprecated]` lets a crate retire its own API. `disallowed_methods` lets a consumer retire **someone else\'s** API. It is a per-project edition for libraries, and it pairs with Clippy\'s `msrv` setting, which turns lints on and off according to the Rust version a project supports.',
    citation: 'Clippy lint list, *disallowed_methods* (since 1.49.0); Clippy configuration docs.',
    link: 'https://rust-lang.github.io/rust-clippy/master/index.html#disallowed_methods'
  },
  {
    date: '2021-05-20',
    team: 'Dylint (Trail of Bits)',
    origin: 'community',
    title: 'Lints from someone else\'s repository',
    tldr: 'Dylint loads Rust lints from dynamic libraries named in your workspace metadata, so you can adopt another team\'s lint collection without forking Clippy.',
    gesture: 'Dylint lets you adopt another team\'s lints the way you adopt a dependency: name a git repository in your workspace metadata and run `cargo dylint`.',
    body: 'Trail of Bits introduced Dylint in "Write Rust lints without forking Clippy." Before it, the simplest way to add a lint was to fork Clippy, and every fork needed its own driver. Dylint compiles lints into **dynamic libraries**, groups them by the compiler version they were built against, and loads any number of them into one driver.\n\nThis is the clearest answer to "can I inherit someone\'s lineage of lints." A workspace lists libraries under `workspace.metadata.dylint.libraries`, or in a `dylint.toml`, as git or path dependencies, with a `pattern` choosing which lint crates in the repository to load. Trail of Bits publishes its own collections that way, under paths such as `examples/general`. Authors write lints with the same `clippy_utils` helpers Clippy uses.',
    thread: 'Dylint lints are rustc lints, so they get the same edition information rustc has, down to the edition of each span. An out-of-tree library can therefore ship its own **edition-aware** checks, or migration lints for its users.',
    citation: 'Trail of Bits, *Write Rust lints without forking Clippy*, 2021; trailofbits/dylint README.',
    link: 'https://github.com/trailofbits/dylint'
  },
  {
    date: '2022',
    team: 'ast-grep',
    origin: 'community',
    title: 'Pattern rules that read like code',
    tldr: 'ast-grep matches tree-sitter syntax trees with patterns written as code, so a YAML rule can flag a deprecated call, explain it and rewrite it, with no compiler involved.',
    gesture: 'ast-grep matches syntax trees with patterns that look like the code you are searching for. A few lines of YAML can flag a deprecated call, explain why, and rewrite it.',
    body: 'Herrington Darkholme started ast-grep in 2022 as a hobby project built on **tree-sitter**. A rule is a YAML object with an `id`, a `language: rust`, a `severity`, a `message`, a `rule` containing a pattern such as `$DT.timestamp()`, and an optional `fix` that reuses the captured metavariables. `sg scan` runs every rule listed in `sgconfig.yml`, exits non-zero on error-level matches for CI, and `--update-all` applies the fixes. It also has an LSP mode, so its diagnostics appear in the editor.\n\nThis is the tool for the case you cannot annotate: a method deprecated in a crate you do not own, or a migration between two versions of a dependency. Because it never compiles your code it is fast and works on code that does not build, but it is **purely syntactic**. A pattern for `.timestamp()` matches every method with that name, whatever the receiver\'s type. Where types matter, Clippy\'s `disallowed_methods` is the precise tool.',
    thread: 'The tree-sitter grammar does not know about editions. A rule sees the same tree whether a crate is on 2018 or 2024, which makes ast-grep a good fit for **library-version** migrations and a poor fit for edition-specific semantics.',
    citation: 'ast-grep documentation, *Lint rule* and *YAML configuration reference*.',
    link: 'https://ast-grep.github.io/guide/project/lint-rule.html'
  },
  {
    date: '2022-06-08',
    team: 'cargo-vet (Mozilla)',
    origin: 'community',
    title: 'Inheriting someone else\'s audits',
    tldr: 'cargo-vet records human audits of dependencies and lets a project import the audit sets that other organizations publish.',
    gesture: 'cargo-vet makes trust in dependencies importable: a project can inherit the published audits of Mozilla, Google and others instead of reviewing every crate itself.',
    body: 'Mozilla announced cargo-vet as fully operational on mozilla-central in June 2022. Every third-party crate must be covered by an audit, either your own or one you import. The `imports` entries in `supply-chain/config.toml` point at other organizations\' audit files, which cargo-vet fetches and pins in `imports.lock`, and the project keeps a registry of well-known audit sets. Google open-sourced its Rust crate audits in 2023.\n\nIt is a check rather than an analyzer, but structurally it is the inherited lineage you asked about. You choose whose judgment to adopt, and the tool tells you exactly which dependencies, and which version changes, remain unreviewed.',
    thread: 'Audits are recorded per crate version, and incremental "delta" audits cover the diff between versions. When a dependency changes edition, that change arrives as an ordinary new version for a reviewer to look at.',
    citation: 'Mozilla dev-platform, *Securing our Rust supply chain with cargo-vet*, 2022-06-08; cargo-vet book, *Importing audits*.',
    link: 'https://mozilla.github.io/cargo-vet/importing-audits.html'
  },
  {
    date: '2022',
    team: 'cargo-semver-checks',
    origin: 'community',
    title: 'Lints written as queries over an API',
    tldr: 'cargo-semver-checks compares the rustdoc JSON of two crate versions with Trustfall queries, one query per semver lint.',
    gesture: 'cargo-semver-checks catches semver violations before publishing. Each of its lints is a declarative query over two versions of a crate\'s public API.',
    body: 'Predrag Gruevski built it on rustdoc JSON and **Trustfall**, a query engine that treats a crate\'s API as a graph. Each lint is a query file describing a breaking pattern, such as a public function that disappeared, a trait that became sealed, or an enum variant that was added to an exhaustive enum. Adding a lint means writing a query plus test crates, not touching the compiler, and that low bar has let the lint set grow quickly through community contributions.\n\nIt has become the de facto pre-publish check in CI, and merging it into Cargo itself has been a Rust project goal.',
    thread: 'Editions cannot retire library APIs; only semver can. cargo-semver-checks enforces the **library-level** half of the compatibility story that editions cover for the language.',
    citation: 'obi1kenobi/cargo-semver-checks README; Rust project goals.',
    link: 'https://github.com/obi1kenobi/cargo-semver-checks'
  },
  {
    date: '2023-03',
    team: 'Semgrep',
    origin: 'community',
    title: 'Shared rule registries reach Rust',
    tldr: 'Semgrep added Rust in beta in early 2023 and reached GA that fall, bringing shareable pattern rules and registry rule packs to Rust.',
    gesture: 'Semgrep brought registry-style rule sharing to Rust: pull in a published rule pack, or write your own in the same YAML.',
    body: 'Semgrep announced beta Rust support in March 2023 and moved Rust to general availability in its fall 2023 update. Like ast-grep, its rules are patterns written as code in YAML, but Semgrep adds dataflow and taint tracking in its Pro engine and a **registry** of published rules that a project can reference by name.\n\nThat registry is a lineage mechanism. A team can adopt a security vendor\'s Rust rules, layer its own on top, and update both independently of the toolchain. Semgrep\'s supply-chain product has since extended reachability analysis to Rust dependencies.',
    thread: 'Rules are versioned with the rule pack, not the compiler or the edition. Like every syntactic tool, Semgrep sees all editions through one grammar.',
    citation: 'Semgrep, *Announcing Semgrep\'s beta support for Rust*, 2023; *Semgrep Fall \'23 launch*.',
    link: 'https://semgrep.dev/blog/2023/announcing-semgrep-s-beta-support-for-rust/'
  },
  {
    date: '2023-07',
    team: 'Marker',
    origin: 'community',
    title: 'Lint crates as dependencies',
    tldr: 'Marker proposed a stable linting API: lint crates declared by version in Cargo.toml, insulated from compiler internals. Development stalled after v0.5 in late 2023.',
    gesture: 'Marker tried to make lints ordinary dependencies: declare a lint crate by version in Cargo.toml, against an API that would not break with every nightly.',
    body: 'Started by Clippy maintainer xFrednet, Marker defines its own **stable AST** in `marker_api` and translates rustc\'s internals into it through an adapter. Lint authors target `marker_api` rather than `rustc_private`. Users list lint crates under `[workspace.metadata.marker.lints]`, by crates.io version, git repository or path, and `cargo marker` builds and runs them.\n\nIt was the most direct design for the inherited lineage of lints you asked about: `some_org_lints = "0.3"` next to your other dependencies. Releases ran from 0.1 in July 2023 to 0.5 in December 2023 and then stopped. The project still describes itself as experimental, and its driver is pinned to a 2023 nightly.',
    thread: 'Marker aimed to give lint authors the decoupling that editions give language users: write against a stable surface and let the compiler change underneath. rustc_public is now pursuing the same goal at the MIR level.',
    citation: 'rust-marker/marker README; *The Marker Book*, Lint crate declaration.',
    link: 'https://rust-marker.github.io/marker/book/usage/lint-crate-declaration.html'
  },
  {
    date: '2025-03-19',
    team: 'bevy_lint (Bevy)',
    origin: 'community',
    title: 'A framework ships its own Clippy',
    tldr: 'bevy_lint is a Clippy-style linter for the Bevy game engine, distributed with the Bevy CLI and configured under [workspace.lints.bevy].',
    gesture: 'bevy_lint is what it looks like when a framework ships its own Clippy, with lints that understand its APIs and a release cadence that follows the framework.',
    body: 'Built by TheBevyFlock as part of the Bevy CLI, bevy_lint is a rustc driver, the same architecture as Clippy, with lints specific to Bevy\'s ECS, schedules and plugins. `bevy lint install` fetches a matching build, and the linter takes the same arguments as `cargo check`. Lints can be configured under `[workspace.lints.bevy]` in Cargo.toml, which is nightly-only and prints a warning.\n\nIt shows the "lineage" model from the library author\'s side. The people who designed an API also publish the analysis that enforces its idioms, so users inherit both together.',
    thread: 'Each bevy_lint release targets one Bevy version (0.6 supports Bevy 0.17 and drops 0.16). For its users, a **framework release behaves like an edition**: a new idiom set, with lints to move code onto it.',
    citation: 'BD103, *Announcing bevy_lint*, 2025-03-19; TheBevyFlock/bevy_cli docs.',
    link: 'https://thebevyflock.github.io/bevy_cli/'
  },
  {
    date: '2025-10-14',
    team: 'CodeQL (GitHub)',
    origin: 'community',
    title: 'Queries as packages',
    tldr: 'CodeQL\'s Rust support reached general availability in October 2025: security analysis written as QL queries and shared as versioned query packs.',
    gesture: 'CodeQL treats analysis as data. Rust code becomes a queryable database, and the checks are QL queries that can be published and depended on as packs.',
    body: 'GitHub put CodeQL Rust support into public preview in mid-2025 and announced general availability on 14 October 2025, with CodeQL CLI 2.23.3. It extracts Rust without a build step and ships security queries such as `rust/log-injection` and `rust/insecure-cookie`, with more added in each release.\n\nCodeQL\'s extension model is the most package-like in this book. Queries and libraries ship as **query packs** with their own versions and dependencies, so an organization can publish its Rust checks and other repositories can consume them in code scanning.',
    thread: 'Query packs are versioned independently of the toolchain and of editions. Like Semgrep, CodeQL adds a vendor-maintained analysis layer that moves on its own release cycle.',
    citation: 'GitHub changelog, *CodeQL scanning Rust and C/C++ without builds is now generally available*, 2025-10-14.',
    link: 'https://github.blog/changelog/2025-10-14-codeql-scanning-rust-and-c-c-without-builds-is-now-generally-available'
  },
  {
    date: '2026-01',
    team: 'klint (Rust for Linux)',
    origin: 'community',
    title: 'Domain lints for the kernel',
    tldr: 'klint, a rustc driver for kernel-specific lints such as sleeping in atomic context, reached RFC patches for integration into the Linux kernel in January 2026.',
    gesture: 'klint adds the analysis the Linux kernel needs and rustc will never ship, starting with catching code that might sleep in atomic context.',
    body: 'Gary Guo has developed klint since 2022 as a rustc driver that uses the compiler as a library. Its headline check tracks atomic context: the kernel\'s Rust abstractions cannot stop code from sleeping while holding a spinlock or inside an RCU read-side section, which can deadlock or, with RCU, cause use-after-free. klint propagates context through calls and reports violations at compile time.\n\nIt is opt-in through `-Dklint::atomic_context`, it is developed against the latest nightly with tagged releases for stable toolchains, and it finds real bugs alongside some false positives. In January 2026 Guo posted RFC patches to integrate it into the kernel build.',
    thread: 'klint\'s lints use a `klint::` namespace, the same tool-lint syntax that rustfmt, Clippy and rustdoc use. It shows a third-party analyzer adopting the project\'s naming conventions while `register_tool` remains unstable.',
    citation: 'Gary Guo, *Klint: compile-time detection of atomic context violations*, ISRG; LWN; Phoronix, January 2026.',
    link: 'https://rust-for-linux.com/klint'
  },

  // ---- Recent: 2026 ----

  {
    date: '2026',
    team: 'Safety-Critical Rust Consortium',
    origin: 'community',
    title: 'Coding standards become Clippy lints',
    tldr: 'A 2026 Rust project goal sets out to give the Safety-Critical Rust Consortium\'s coding-standard lints a permanent home in Clippy rather than a fork.',
    gesture: 'Safety-critical industries want MISRA-style rules for Rust, and a 2026 project goal aims to put them in Clippy itself rather than in a fork.',
    body: 'The Rust Foundation\'s Safety-Critical Rust Consortium is writing coding guidelines for Rust, with MISRA C and CERT C mapped onto the FLS. That mapping found 68 MISRA C:2025 guidelines directly applicable to Rust, and about 50 that would need lints beyond what Clippy covers today.\n\nThe 2026 project goal "Establish a spot for safety-critical lints in Clippy" proposes that these lints go straight into Clippy, perhaps as a dedicated lint group or a separate crate inside the Clippy repository, with consortium members contributing and mentoring reviewers. Keeping them in Clippy matters because some safety-critical companies are exploring **qualifying Clippy** as a tool, and a qualified tool cannot be a moving fork.',
    thread: 'This is the uplift path from the first slide run in reverse. An outside community brings its lint lineage **into** the project\'s analyzer, so its lints ship and version with the toolchain.',
    citation: 'Rust project goals 2026, *Establish a spot for safety-critical lints in Clippy*; Safety-Critical Rust Coding Guidelines.',
    link: 'https://goals.rust-lang.org/2026/safety-critical-lints-in-clippy.html'
  },
  {
    date: '2026-05-13',
    team: 'Edition',
    origin: 'project',
    title: 'Proving a migration changed nothing',
    tldr: 'Planning for the next edition surfaced a new demand from Rust for Linux: migration tooling with zero false negatives, perhaps by comparing MIR across editions.',
    gesture: 'Planning for the next edition ran into a demand the lint pipeline cannot yet meet: proof that a migration changed no behavior.',
    body: 'Since March 2025 rustc has had a permanently unstable **future** edition. Its author, David Wood, put it this way: "It\'s hard to implement edition migrations without having a perma-unstable \'future\' edition to target." Edition changes can land there with their migration lints, and a proposed policy would keep any change without complete migration lints in `future` when an edition is cut.\n\nThe April 2026 program management update recorded the harder problem. Rust for Linux backports patches semi-automatically between kernel branches, and anything that changes drop order, such as Rust 2024\'s `if let` temporary scope change, could introduce undefined behavior in code that looks identical in both editions. Miguel Ojeda asked for a "zero false negative rate." TC answered that edition lints and `cargo fix` are "not set up to make this a guarantee." Benno Lossin proposed compiling under both editions and **comparing the MIR**: "If they\'re identical, no semantic changes occurred."',
    thread: 'This closes a loop with the Miri slide. Because MIR is edition-agnostic, it is the natural place to check that an edition migration changed **nothing**. Analysis would move from flagging what might change to proving what did not.',
    citation: 'Inside Rust, *Program management update — April 2026*, 2026-05-13; rust-lang/rust #137606.',
    link: 'https://blog.rust-lang.org/inside-rust/2026/05/13/program-management-update--april-2026/'
  },
  {
    date: '2026-05-28',
    team: 'Cargo',
    origin: 'project',
    title: 'Cargo lints the build itself',
    tldr: 'Cargo 1.96 added an unused_dependencies lint to its own linting system, which a 2026 goal set out to stabilize, starting with unused-dependency detection.',
    gesture: 'Cargo now has a linter of its own. Its first major lint looks at the build rather than the code: dependencies you declare but never use.',
    body: 'Cargo 1.96 added `unused_dependencies` under `-Zcargo-lints`. Later releases taught it to summarize results, to stop deferring to rustc\'s `unused_crate_dependencies`, and to bound how far it follows transitive dependencies. It stays quiet where it cannot be sure. For example, it does not warn about `[dependencies]` during `cargo check --bin foo`, because another binary might use them. As of Cargo 1.100 the linting system is still nightly-only.\n\nThe 2026 goal "Stabilize Cargo\'s linting system," led by Ed Page with the cargo, clippy and compiler teams, set out to bring Cargo\'s lints up to the level of rustc and Clippy. Unused-dependency detection was its motivating example, because removing dead dependencies improves build times. Cargo 1.99 also began warning on hyphenated names in `[lints]`, such as `unexpected-cfgs` instead of `unexpected_cfgs`.',
    thread: 'The `[lints]` table from 2023 now configures a fourth namespace, `cargo::`. The same table that stages edition lints for rustc now governs **manifest-level** checks as well.',
    citation: '*The Cargo Book*, Changelog (1.96–1.100); Rust project goals 2026, *Stabilize Cargo\'s linting system*.',
    link: 'https://goals.rust-lang.org/2026/cargo-lints.html'
  },
  {
    date: '2026-08-21',
    team: 'Types',
    origin: 'project',
    title: 'One trait solver for compiler and IDE',
    tldr: 'The next-generation trait solver was enabled by default on nightly after rust-analyzer had already switched to it, so rustc and the IDE now share one implementation.',
    gesture: 'The next-generation trait solver was turned on by default on nightly, and rust-analyzer was already running it. For the first time the compiler and the IDE share one implementation of trait solving.',
    body: 'rust-analyzer replaced chalk, which was effectively unmaintained, with the new solver in October 2025, consuming it through the auto-published `ra_ap_rustc_next_trait_solver` crate. On 21 August 2026 the Trait System Refactor Initiative enabled the solver by default on nightly. After "nearly 4 years of active development," it "completely replaces how we prove where-clauses, normalize associated types, and much more." The announcement cited more than 200 GitHub issues fixed and one crate compiling more than eight times faster. Stabilization was planned for the following months.\n\nFor analyzers, this means the hardest part of Rust\'s semantics is now one library shared by two front-ends. It ends the long era in which the IDE\'s answer to "does this type implement that trait?" was an approximation of rustc\'s.',
    thread: 'A shared solver means the IDE and the compiler agree on the trait rules for every edition. When an edition changes those rules, as Rust 2024 did with `impl Trait` captures, both tools change together.',
    citation: 'lcnr, *Enabling the next-generation trait solver on nightly*, Rust Blog, 2026-08-21; *This Week in rust-analyzer* #299, 2025-10-27.',
    link: 'https://blog.rust-lang.org/2026/08/21/enabling-next-solver-on-nightly'
  },
  {
    date: '2026-11-09',
    team: 'cargo-modernize',
    origin: 'community',
    title: 'Packaging the ecosystem\'s deprecations',
    tldr: 'cargo-modernize packages many crates\' deprecations and migrations as version-gated TOML rule packs, reported as upgrade plans in the terminal or through its own language server.',
    gesture: '"Clippy tells you about your code; `cargo modernize` tells you where the ecosystem has moved on." It packages many crates\' deprecations as actionable upgrade plans.',
    body: 'Most analyzers in this book know about one crate at a time: rustc knows `#[deprecated]` for the API in front of it, and Clippy\'s `disallowed_methods` knows the list you wrote. cargo-modernize works one level up. Its **rule packs** are TOML data, each keyed to a dependency, a version range and a `since_rust`. A rule fires only when your `Cargo.lock` resolves a matching version and your `rust-version` allows the replacement. Findings are grouped into plans, such as "rand → 0.10", "Now in std" or "Edition 2024", with ESLint-style levels (`deny`, `warn`, `suggest`, `off`). `.modernize` files cascade like `.editorconfig` and can define project-local rules.\n\nOutput goes to the terminal in rustc\'s diagnostic style, or to the editor through `cargo-modernize-lsp`. `--fix` applies only mechanical rewrites. `--dangerous` attempts the API migrations, runs `cargo check`, and reverts whatever breaks. A weekly job generates `ecosystem.toml` from RustSec, crates.io and GitHub, recording maintenance status with evidence and scoring candidate successor crates. The tool ships as a battery pack with agent skills for running a modernization pass. The rules were mined from 2019 and 2026 snapshots of rust-cookbook, ripgrep, bat and other long-lived projects, then tested on 120 projects from awesome-rust, the cookbook and blessed.rs across 2015–2024.',
    thread: 'The edition contract applied to the whole ecosystem. `walk.toml` moves a crate one Rust release band at a time from 1.0 to today, and the edition steps preview their cleanups (`extern crate` is a fix-less suggestion on 2015, then a fix after the bump). Every crate upgrade becomes an **opt-in, stepwise, verified migration**, like an edition. Like ast-grep it has no type information, and version gating is how it keeps matches by name honest.',
    citation: 'AndyGauge/cargo-modernize README, *docs/RESEARCH.md* and *docs/ECOSYSTEM-STUDY.md*, November 2026.',
    link: 'https://github.com/AndyGauge/cargo-modernize'
  }
];

// Project-maintained vs. community-maintained. Rendered beside the team name.
export const ORIGINS = {
  project: { emoji: '🦀', label: 'Rust project' },
  community: { emoji: '🧩', label: 'Community' }
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseDate(date) {
  const [y, m, d] = date.split('-').map(Number);
  const year = y + (m ? (m - 1) / 12 : 0) + (d ? (d - 1) / 365 : 0);
  const label = d ? `${d} ${MONTHS[m - 1]} ${y}` : m ? `${MONTHS[m - 1]} ${y}` : String(y);
  return { year, label, yearInt: y };
}

export const flat = raw
  .map((s) => ({ ...s, ...parseDate(s.date) }))
  .sort((a, b) => a.year - b.year)
  .map((s, i) => ({ ...s, num: String(i + 1).padStart(2, '0'), orderIndex: i }));

export const YEAR_MIN = Math.floor(Math.min(...flat.map((s) => s.year)));
export const YEAR_MAX = Math.max(...flat.map((s) => s.year));

export function next(num) {
  const i = flat.findIndex((s) => s.num === num);
  return i >= 0 && i < flat.length - 1 ? flat[i + 1] : null;
}

export function prev(num) {
  const i = flat.findIndex((s) => s.num === num);
  return i > 0 ? flat[i - 1] : null;
}
