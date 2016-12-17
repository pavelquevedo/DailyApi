DELIMITER //
 
CREATE PROCEDURE `spc_daily_tract_detail` (IN daily_id INT, IN active_status INT)
BEGIN
    DECLARE total INT;
    SET total = (SELECT COUNT(1) FROM daily_detail WHERE daily_id = daily_id);
 
    IF total > 0 THEN
        	SELECT t.*, s.name as state, c.name as county, tt.name as treeType, 
           	rt.name as rootType, SUM(dd.trees) as trees, SUM(dd.trees / t.trees_per_box) as boxes 
           	FROM tract t 
			INNER JOIN daily_tract dt ON dt.tract_id = t.id 
			INNER JOIN state s ON s.id = t.state_id 
			INNER JOIN county c ON c.id = t.county_id 
			INNER JOIN tree_type tt ON tt.id = t.tree_type_id 
			INNER JOIN root_type rt ON rt.id = t.root_type_id 
			INNER JOIN daily_detail dd ON dd.tract_id = t.id AND dd.daily_id = dt.daily_id 
			WHERE dt.status_daily_tract = active_status
			AND dt.daily_id = daily_id
			GROUP BY t.id, s.id, c.id;
    ELSE
    		SELECT t.*, s.name as state, c.name as county, tt.name as treeType, 
           	rt.name as rootType, 0 as trees, 0 as boxes
           	FROM tract t 
			INNER JOIN daily_tract dt ON dt.tract_id = t.id 
			INNER JOIN state s ON s.id = t.state_id 
			INNER JOIN county c ON c.id = t.county_id 
			INNER JOIN tree_type tt ON tt.id = t.tree_type_id 
			INNER JOIN root_type rt ON rt.id = t.root_type_id 
			WHERE dt.status_daily_tract = active_status
			AND dt.daily_id = daily_id
			GROUP BY t.id, s.id, c.id;
    END IF;
END //
