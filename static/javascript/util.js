var github_url = "/auth/github";
var google_url = "/auth/google";
var dropbox_url = "/auth/dropbox";
var web_id_url = "/auth/web_id";
var webidPort = 1443;
/**
 * Creates a table containing the provided json for display.
 *
 * @param json
 *            The json which should be parsed into a table
 * @returns The table containing the json.
 */

function display_json(json) {

  var table = $('<table></table>').addClass('jsonTable');
  var row = $('<tr></tr>').addClass('row').text(': ');
  add_json(table, json, '');

  return table;
}

/**
 * Adds a key value pair to the given table.
 *
 * @param table
 *            The table to add the key value pair.
 * @param json
 *            The json to put into the table
 * @param str
 *            String representing the depth of the pair.
 */
function add_json(table, json, str) {

  str = str + "\xa0\xa0\xa0\xa0";
  var row;
  $.each(json, function (k, v) {
    if (v === null) {

    } else if (v.constructor == Object) {

      // !caution remove numbers as keys for display purpose
      if (isNaN(parseFloat(k))) {

        row = $('<tr></tr>').addClass('row').text(str + k + ': ');
        table.append(row);
      }

      add_json(table, v, str);

    } else if (v.constructor == Array) {

      row = $('<tr></tr>').addClass('row').text(str + k + ': ');
      table.append(row);
      add_json(table, v, str);

    } else {

      // !caution remove numbers as keys for display purpose
      row = '';
      if (isNaN(parseFloat(k))) {

        row = $('<tr></tr>').addClass('row').text(str + k + ': ' + v);

      } else {

        row = $('<tr></tr>').addClass('row').text(str + v);
      }
      table.append(row);
    }
  });
}