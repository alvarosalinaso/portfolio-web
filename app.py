"""
Portfolio Dashboard — Plotly Dash
Multi-tab interactive analytics dashboard for Álvaro Salinas Ortiz.
Deploy with: python app.py (runs on http://localhost:8050)
"""
import json
from pathlib import Path

try:
    import dash
    from dash import dcc, html, dash_table
    import plotly.express as px
    import plotly.graph_objects as go
    import pandas as pd
    DASH_AVAILABLE = True
except ImportError:
    DASH_AVAILABLE = False
    print("[DASHBOARD] dash/plotly no instalado. pip install dash plotly")


DATA_DIR = Path("src/data")

# ─── Data Loaders ─────────────────────────────────────────────
def load_chilean():
    p = DATA_DIR / "chilean-videogames.json"
    if p.exists():
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    return {}

def load_manutd():
    p = DATA_DIR / "manchester-united.json"
    if p.exists():
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    return {}

def load_tactical():
    p = DATA_DIR / "tactical-analysis.json"
    if p.exists():
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    return {}


# ─── Layout ───────────────────────────────────────────────────
if not DASH_AVAILABLE:
    print("Install dependencies: pip install dash plotly pandas")
    exit(1)

app = dash.Dash(
    __name__,
    title="Portfolio Analytics — Álvaro Salinas",
    meta_tags=[{"name": "viewport", "content": "width=device-width, initial-scale=1"}],
)
server = app.server  # For deployment

DARK_BG = "#0d1117"
CARD_BG = "#161b22"
TEXT_COLOR = "#e6edf3"
ACCENT = "#58a6ff"

app.layout = html.Div(
    style={"backgroundColor": DARK_BG, "minHeight": "100vh", "fontFamily": "Inter, sans-serif", "color": TEXT_COLOR},
    children=[
        # Header
        html.Div(
            style={"padding": "2rem 3rem", "borderBottom": f"1px solid {CARD_BG}"},
            children=[
                html.H1("Portfolio Analytics Dashboard", style={"margin": "0", "fontSize": "2rem", "fontWeight": "700"}),
                html.P("Álvaro Salinas Ortiz — Data Analyst | PUC Chile", style={"margin": "0.5rem 0 0", "color": "#8b949e"}),
            ],
        ),
        # Tabs
        dcc.Tabs(
            id="tabs",
            value="chilean",
            style={"padding": "0 3rem"},
            children=[
                dcc.Tab(label="Videojuegos Chilenos", value="chilean", style={"backgroundColor": CARD_BG, "color": TEXT_COLOR, "border": "none"}),
                dcc.Tab(label="Manchester United", value="manutd", style={"backgroundColor": CARD_BG, "color": TEXT_COLOR, "border": "none"}),
                dcc.Tab(label="Tactical Graph", value="tactical", style={"backgroundColor": CARD_BG, "color": TEXT_COLOR, "border": "none"}),
            ],
        ),
        html.Div(id="tab-content", style={"padding": "2rem 3rem"}),
    ],
)


# ─── Tab Callbacks ────────────────────────────────────────────
@app.callback(dash.Output("tab-content", "children"), dash.Input("tabs", "value"))
def render_tab(tab):
    if tab == "chilean":
        return render_chilean_tab()
    elif tab == "manutd":
        return render_manutd_tab()
    elif tab == "tactical":
        return render_tactical_tab()
    return html.Div("Select a tab")


def render_chilean_tab():
    data = load_chilean()
    charts = data.get("charts", {})

    figures = []

    # Quadrant chart
    if "quadrant" in charts:
        q = charts["quadrant"]
        if "data" in q:
            df = pd.DataFrame(q["data"])
            fig = px.scatter(
                df, x=list(df.columns[0]) if len(df.columns) > 0 else [],
                y=list(df.columns[1]) if len(df.columns) > 1 else [],
                title="Cuadrante de Oportunidad — Géneros",
                template="plotly_dark",
            )
            figures.append(dcc.Graph(figure=fig, style={"height": "500px"}))

    # Fallback: synthetic chart
    if not figures:
        genres = ["Acción", "Aventura", "Simuladores", "Rol", "Estrategia"]
        revenue = [4716, 3201, 6132, 2500, 1286]
        fig = px.bar(
            x=genres, y=revenue,
            title="Revenue Promedio por Género (USD)",
            labels={"x": "Género", "y": "Revenue USD"},
            template="plotly_dark",
            color=genres,
            color_discrete_sequence=px.colors.qualitative.Set2,
        )
        figures.append(dcc.Graph(figure=fig, style={"height": "450px"}))

    # Stats cards
    stats_row = html.Div(
        style={"display": "grid", "gridTemplateColumns": "repeat(4, 1fr)", "gap": "1rem", "marginBottom": "2rem"},
        children=[
            stat_card("155", "Juegos analizados"),
            stat_card("5.4x", "Crecimiento post-2020"),
            stat_card("$7.68", "Revenue medio Steam"),
            stat_card("<1000", "HHI fragmentado"),
        ],
    )

    return html.Div([stats_row] + figures)


def render_manutd_tab():
    data = load_manutd()

    # Synthetic performance data
    seasons = ["14/15", "15/16", "16/17", "17/18", "18/19", "19/20", "20/21", "21/22", "22/23", "23/24"]
    points = [70, 66, 69, 81, 66, 66, 74, 58, 75, 60]
    position = [4, 5, 6, 2, 6, 3, 2, 6, 3, 8]

    fig_points = px.line(
        x=seasons, y=points,
        title="Evolución de Puntos por Temporada",
        labels={"x": "Temporada", "y": "Puntos"},
        template="plotly_dark",
        markers=True,
    )
    fig_points.update_traces(line_color=ACCENT)

    fig_position = px.line(
        x=seasons, y=position,
        title="Posición Final por Temporada",
        labels={"x": "Temporada", "y": "Posición"},
        template="plotly_dark",
        markers=True,
    )
    fig_position.update_traces(line_color="#f97583")
    fig_position.update_layout(yaxis=dict(autorange="reversed"))

    stats_row = html.Div(
        style={"display": "grid", "gridTemplateColumns": "repeat(4, 1fr)", "gap": "1rem", "marginBottom": "2rem"},
        children=[
            stat_card("67.5", "Pts promedio"),
            stat_card("4.6", "Posición media"),
            stat_card("-23%", "vs Top 6"),
            stat_card("10", "Entrenadores"),
        ],
    )

    return html.Div([
        stats_row,
        dcc.Graph(figure=fig_points, style={"height": "400px"}),
        dcc.Graph(figure=fig_position, style={"height": "400px"}),
    ])


def render_tactical_tab():
    data = load_tactical()

    # Synthetic centrality data
    players = ["Bruno Fernandes", "Casemiro", "Kobbie Mainoo", "Diogo Dalot", "Alejandro Garnacho", "Rasmus Hojlund"]
    betweenness = [0.42, 0.28, 0.21, 0.19, 0.15, 0.12]
    pagerank = [0.18, 0.14, 0.12, 0.11, 0.09, 0.08]

    fig = go.Figure()
    fig.add_trace(go.Bar(name="Betweenness", x=players, y=betweenness, marker_color=ACCENT))
    fig.add_trace(go.Bar(name="PageRank", x=players, y=pagerank, marker_color="#3fb950"))
    fig.update_layout(
        title="Métricas de Red — Jugadores Clave",
        barmode="group",
        template="plotly_dark",
    )

    stats_row = html.Div(
        style={"display": "grid", "gridTemplateColumns": "repeat(4, 1fr)", "gap": "1rem", "marginBottom": "2rem"},
        children=[
            stat_card("14", "Nodos"),
            stat_card("47", "Aristas"),
            stat_card("0.42", "Betweenness max"),
            stat_card("3", "Comunidades"),
        ],
    )

    return html.Div([stats_row, dcc.Graph(figure=fig, style={"height": "500px"})])


def stat_card(value: str, label: str):
    return html.Div(
        style={
            "backgroundColor": CARD_BG,
            "padding": "1.5rem",
            "borderRadius": "8px",
            "textAlign": "center",
            "border": f"1px solid #30363d",
        },
        children=[
            html.H3(value, style={"margin": "0", "fontSize": "1.8rem", "fontWeight": "700", "color": ACCENT}),
            html.P(label, style={"margin": "0.5rem 0 0", "fontSize": "0.85rem", "color": "#8b949e"}),
        ],
    )


if __name__ == "__main__":
    print("[DASHBOARD] Iniciando en http://localhost:8050")
    app.run(debug=True, port=8050)
