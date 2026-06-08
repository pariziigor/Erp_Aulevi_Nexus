import unittest

from fastapi import HTTPException

from src.api.quotes import _validate_status_transition
from src.models.quote import QuoteStatus


class QuoteStatusTransitionTests(unittest.TestCase):
    def test_allows_valid_status_transition(self):
        _validate_status_transition(QuoteStatus.RASCUNHO, QuoteStatus.PENDENTE)

    def test_allows_same_status(self):
        _validate_status_transition(QuoteStatus.PENDENTE, QuoteStatus.PENDENTE)

    def test_rejects_invalid_status_transition(self):
        with self.assertRaises(HTTPException) as context:
            _validate_status_transition(QuoteStatus.CANCELADO, QuoteStatus.APROVADO)

        self.assertEqual(context.exception.status_code, 409)
        self.assertIn("CANCELADO -> APROVADO", context.exception.detail)


if __name__ == "__main__":
    unittest.main()
