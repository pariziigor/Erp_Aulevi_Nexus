import unittest

from src.services.cnpj import CNPJService


class CNPJValidationTests(unittest.TestCase):
    def test_accepts_valid_cnpj(self):
        self.assertTrue(CNPJService.validar_cnpj("11.222.333/0001-81"))

    def test_rejects_invalid_check_digits(self):
        self.assertFalse(CNPJService.validar_cnpj("11.222.333/0001-82"))

    def test_rejects_repeated_digits(self):
        self.assertFalse(CNPJService.validar_cnpj("00.000.000/0000-00"))


if __name__ == "__main__":
    unittest.main()
