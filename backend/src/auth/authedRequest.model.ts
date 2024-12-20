interface AuthedRequest extends Request {
  user: {
    id: string;
  };
}
