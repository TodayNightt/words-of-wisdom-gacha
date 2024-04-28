pub trait Extractor {
    type ReturnValue;
    fn data(self) -> Self::ReturnValue;
}
