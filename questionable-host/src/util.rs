pub type BoxedError = Box<dyn std::error::Error + Send + Sync>;
pub type MyResult<T> = Result<T, BoxedError>;
