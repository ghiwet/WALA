package pointerAnalysis;

import java.util.Iterator;
import com.ibm.wala.cast.loader.AstMethod;
import com.ibm.wala.ipa.callgraph.CGNode;
import com.ibm.wala.ipa.callgraph.CallGraph;
import com.ibm.wala.ipa.callgraph.propagation.HeapModel;
import com.ibm.wala.ipa.callgraph.propagation.InstanceKey;
import com.ibm.wala.ipa.callgraph.propagation.PointerAnalysisImpl;
import com.ibm.wala.ipa.callgraph.propagation.PointerKey;
import com.ibm.wala.ssa.IR;
import com.ibm.wala.ssa.ReflectiveMemberAccess;
import com.ibm.wala.ssa.SSAAbstractInvokeInstruction;
import com.ibm.wala.ssa.SSAFieldAccessInstruction;
import com.ibm.wala.ssa.SSAGetInstruction;
import com.ibm.wala.ssa.SSAInstruction;
import com.ibm.wala.util.intset.OrdinalSet;
import com.ibm.wala.cast.ir.ssa.AstGlobalRead;
import com.ibm.wala.cast.js.loader.JavaScriptLoader;
import com.ibm.wala.cast.ir.ssa.AstLexicalAccess;
public class PointsToSize {
	public static int totalCount;
	public static float totalPtsSize;
	
	/**
	 * Average points-to sets of variables across all calling contexts
	 * @param cg
	 * @param pa
	 * @param fileName
	 * @return
	 */
	public static float avgPtsSize(CallGraph cg, PointerAnalysisImpl pa, String fileName) {
		totalCount =0;
		totalPtsSize =0;
		Iterator<CGNode> nodeIt= cg.iterator();
		
		while(nodeIt.hasNext()) {
			CGNode node = nodeIt.next();
			if(node.getMethod().toString().contains("Code body of function") && node.getMethod().getDeclaringClass().getName().toString().startsWith("L" + fileName))	{
				ptsSize(cg, pa, node, fileName);
			}			
			
		}
		
		return totalPtsSize/totalCount;
			
	}
	
	/**
	 * Calculate the unique points-to sets of all variables in a CGNode
	 * @param cg
	 * @param pa
	 * @param node
	 * @param fileName 
	 * @return
	 */
	public static void ptsSize(CallGraph cg, PointerAnalysisImpl pa, CGNode node, String fileName) {
	
		IR ir = node.getIR();
		int valuenum =0;
		Iterator<SSAInstruction> instrIt = ir.iterateAllInstructions();
		while(instrIt.hasNext()) {
			SSAInstruction inst = instrIt.next();
			if(inst.getNumberOfUses()>0){				
				if(inst instanceof SSAAbstractInvokeInstruction){
					int j=-1;
					if(inst.toString().contains("dispatch") || inst.toString().contains("invoke"))
						j=1; // this object not considered in SAFE
					
					if(inst.toString().contains("construct") && inst.getNumberOfUses()==1 ) 
						j=0; //empty object({}) not considered in SAFE
					
					for(int i=0;i<inst.getNumberOfUses();i++){
						if (i==j) continue; 
						valuenum = inst.getUse(i);
						computePtsToSet(pa, node, valuenum, inst);
					}
				}
				else if(!inst.toString().contains("LRoot, prototype") && (inst instanceof SSAGetInstruction || inst instanceof ReflectiveMemberAccess)) {
					
					 valuenum =  inst.getUse(inst.getNumberOfUses()-1);
					 computePtsToSet(pa, node, valuenum, inst);
				}
			}	
		}
	}
	/**
	 * Calculate the points-to sets size of each instruction
	 * @param pa
	 * @param node
	 * @param valuenum
	 * @param inst
	 * @return
	 */
	public static void computePtsToSet(PointerAnalysisImpl pa, CGNode node, int valuenum, SSAInstruction inst){
		
		PointerKey pk = pa.getHeapModel().getPointerKeyForLocal(node, valuenum);					
		OrdinalSet<InstanceKey> os = pa.getPointsToSet(pk);
		if(os.size()>0){
			// getting existing field 
			if(!inst.toString().contains("getfield")){
				totalCount++;
				totalPtsSize+= os.size();
			}
			else{
				totalPtsSize+= os.size()-1;	
			}

			//System.out.println(pk + " inst: "  + inst +" (line " +((AstMethod) node.getIR().getMethod()).getLineNumber(inst.iindex) +")" + os.size());
			//System.out.println("points-to: " +  pa.getPointsToSet(pk) +"\n");
		}
			
	}
	/**
	 * Average point-to set sizes of field accesses in a call graph 
	 * @param cg
	 * @param pa
	 * @param fileName
	 * @return
	 */	
	public static float avgRefSize(CallGraph cg, PointerAnalysisImpl pa, String fileName){
		
		int count = 0;
		float pts= 0;
		float temp =0;
		Iterator<CGNode> nodes = cg.iterator();		
		while(nodes.hasNext()) {
			CGNode node = nodes.next();
			if(node.getMethod().toString().contains("Code body of function") && !node.getMethod().toString().contains("Lprologue.js>")){
				temp =refSize(node, pa);
				if(temp>0){
					pts+= temp;
					count++;	
				}
			}
		}
		
		return pts/count;		
	}
	/**
	 * Count the point-to set sizes of field accesses in a call graph node
	 * @param node
	 * @param pa
	 * @return
	 */
	public static float refSize(CGNode node, PointerAnalysisImpl pa) {
		float refSize = 0.0f;
		int count =0;
		IR ir = node.getIR();
		HeapModel hm = pa.getHeapModel();
		Iterator<SSAInstruction> it = ir.iterateNormalInstructions();
		while(it.hasNext()) {
			SSAInstruction inst = it.next();
			if(inst instanceof SSAFieldAccessInstruction) {
				
				SSAFieldAccessInstruction fai = (SSAFieldAccessInstruction)inst;
				if(fai.getUse(0) != -1) {
					PointerKey pk = hm.getPointerKeyForLocal(node, fai.getUse(0));
					refSize += pa.getPointsToSet(pk).size();
					count++;
				}
			} 
			else if(inst instanceof ReflectiveMemberAccess) {
				
				ReflectiveMemberAccess rma = (ReflectiveMemberAccess)inst;
				if(rma.getUse(1) != -1) {
					PointerKey pk = hm.getPointerKeyForLocal(node, rma.getUse(1));
					refSize += pa.getPointsToSet(pk).size();
					count++;
				}
			}
			
		
		}
		return count==0? 0:refSize/count;
	}
	
}
