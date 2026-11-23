"""Render the editable slide description as a standard widescreen PowerPoint."""
import argparse
import json
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, MSO_AUTO_SIZE
from pptx.util import Emu, Pt

HERE = Path(__file__).resolve().parent
MEDIA = HERE.parent / "media"


def rgb(value):
    return RGBColor.from_string(value.lstrip("#"))


def render(source, destination):
    data = json.loads(source.read_text())
    deck = Presentation()
    # Lay out the source on a 13 1/3 × 7.5 inch slide.
    units = 12192000 / data["width"]
    deck.slide_width = Emu(round(data["width"] * units))
    deck.slide_height = Emu(round(data["height"] * units))
    slide = deck.slides.add_slide(deck.slide_layouts[6])
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = rgb(data["background"])
    for item in data["elements"]:
        bounds = [Emu(round(value * units)) for value in item["bounds"]]
        if item["kind"] == "image":
            shape = slide.shapes.add_picture(str(source.parent / item["file"]), *bounds)
            shape._element.nvPicPr.cNvPr.set("descr", item["alt"])
        elif item["kind"] == "shape":
            shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, *bounds)
            shape.fill.solid()
            shape.fill.fore_color.rgb = rgb(item["color"])
            shape.line.fill.background()
            shape.shadow.inherit = False
        else:
            shape = slide.shapes.add_textbox(*bounds)
            frame = shape.text_frame
            frame.margin_left = frame.margin_right = frame.margin_top = frame.margin_bottom = 0
            frame.auto_size = MSO_AUTO_SIZE.NONE
            frame.word_wrap = False
            frame.vertical_anchor = MSO_ANCHOR.TOP
            for index, line in enumerate(item["text"].splitlines()):
                p = frame.add_paragraph() if index else frame.paragraphs[0]
                p.space_before = p.space_after = Pt(0)
                p.line_spacing = 1.0
                run = p.add_run()
                run.text = line
                run.font.name = data["font"]
                run.font.size = Pt(item["fontSize"] * units / 12700)
                run.font.bold = item["bold"]
                run.font.color.rgb = rgb(item["color"])
        shape.name = item["name"]
    slide.notes_slide.notes_text_frame.text = data["speakerNotes"]
    deck.core_properties.title = "NPC Pipeline"
    deck.core_properties.author = "Arcade"
    destination.parent.mkdir(parents=True, exist_ok=True)
    deck.save(destination)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=HERE / "slide.json")
    parser.add_argument("--output", type=Path, default=MEDIA / "npc-pipeline.pptx")
    args = parser.parse_args()
    render(args.source, args.output)
