pub type Result<T> = core::result::Result<T, Error>;

pub enum Error {
    CtxVisitorCannotBeRoot,
}

impl core::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("Visitor cannot get the root context")
    }
}
