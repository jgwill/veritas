"""Smoke and rejection checks for the optional, non-app print helper."""
import importlib.util
import json
import tempfile
import subprocess
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
SCRIPT = HERE / 'scripts' / 'render.py'
SPEC = HERE / 'templates' / 'housing-one-page.json'
spec = importlib.util.spec_from_file_location('decision_print_renderer', SCRIPT)
assert spec is not None and spec.loader is not None
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)

class RenderTest(unittest.TestCase):
    def test_example_one_page_and_all_factor_names(self):
        with tempfile.TemporaryDirectory() as d:
            output = Path(d) / 'example.pdf'
            renderer.render(SPEC, output)
            info = subprocess.run(['pdfinfo', str(output)], capture_output=True, text=True, check=True).stdout
            self.assertIn('Pages:           1', info)
            self.assertIn('Page size:       792 x 612 pts', info)
            content = subprocess.run(['pdftotext', '-layout', str(output), '-'], capture_output=True, text=True, check=True).stdout
            factors = json.loads(SPEC.read_text(encoding='utf-8'))['factors']
            for item in factors:
                self.assertEqual(content.count(item['name']), 1, item['name'])
            self.assertEqual(content.count('non acceptable'), len(factors))
            self.assertNotIn('à vérifier', content)

    def test_reject_duplicate_ids_and_overflow(self):
        source = json.loads(SPEC.read_text(encoding='utf-8'))
        with tempfile.TemporaryDirectory() as d:
            inp, out = Path(d) / 'input.json', Path(d) / 'output.pdf'
            source['factors'][1]['id'] = source['factors'][0]['id']
            inp.write_text(json.dumps(source), encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'unique'):
                renderer.render(inp, out)
            source['factors'] = source['factors'] + [dict(source['factors'][0], id='14'), dict(source['factors'][0], id='15')]
            inp.write_text(json.dumps(source), encoding='utf-8')
            with self.assertRaisesRegex(ValueError, '1–14'):
                renderer.render(inp, out)
            self.assertFalse(out.exists())

if __name__ == '__main__':
    unittest.main()
