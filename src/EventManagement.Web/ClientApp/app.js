import $ from "jquery";
window.jQuery = $;
window.$ = $;
import "bootstrap";
import "./sass/main.scss";

// Admin only (TODO: move to separate build)
import "bootstrap-3-typeahead";
import Sortable from "sortablejs";
window.Sortable = Sortable;