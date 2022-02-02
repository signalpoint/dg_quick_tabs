/**
 * Implements hook_pre_process_route_change().
 */
function dg_quick_tabs_pre_process_route_change(newPath, oldPath) {

  // Clear all quick tabs.
  dg_quick_tabs.clear();

}
