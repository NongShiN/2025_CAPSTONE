from util.util import load_cbt_technique_info

cbt_info = load_cbt_technique_info("cbt_info.json")
cbt_technique = "Evidence-Based Questioning"
technique_data = cbt_info[cbt_technique]
print(technique_data)
#technique_data = cbt_info.get("Evidence-Based Questioning".strip(), {})
progress_description = "\n".join([f"{s['stage']}: {s['description']}" for s in technique_data.get("stages", [])])
example_dialogue = technique_data.get("example", "")
print("==================================")
print(f"cbt_info: {cbt_info}")
print(f"technique_data : {technique_data}")
print(f"progress_description : {progress_description}")
print("==================================")